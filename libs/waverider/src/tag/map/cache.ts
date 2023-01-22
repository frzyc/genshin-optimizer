import type { Tag } from '../type'
import { TagMapKeys } from './keys'
import { InternalTagMapValues, TagMapValues } from './values'

export function createSubsetCache<V>(keys: TagMapKeys, values: TagMapValues<V>): TagMapSubsetCache<V> {
  let last = new InternalTagMapSubsetCache(undefined as any, [values.internal])
  const tagLen = keys.tagLen
  for (let i = 0; i < tagLen; i++) last = last.child(0)
  return new TagMapSubsetCache(new Int32Array(tagLen).fill(0), {}, keys, last)
}
export class TagMapSubsetCache<V> {
  id: Int32Array
  keys: TagMapKeys
  tagLen: number
  tag: Tag
  internal: InternalTagMapSubsetCache<V>

  constructor(id: Int32Array, tag: Tag, keys: TagMapKeys, internal: InternalTagMapSubsetCache<V>) {
    this.id = id
    for (const [key, value] of Object.entries(tag))
      if (value === null) delete tag[key]
    this.tag = tag
    this.keys = keys
    this.tagLen = keys.tagLen
    this.internal = internal
  }

  subset(): V[] {
    return this.internal.entries.flatMap(x => x.values)
  }
  with(tag: Tag): TagMapSubsetCache<V> {
    const { id: extra, mask, minByteOffset } = this.keys.getMaskWithNull(tag)
    const id = this.id.slice(), tagLen = this.tagLen
    for (let i = minByteOffset; i <= this.tagLen; i++)
      id[i]! = id[i]! & ~mask[i]! | extra[i]!

    let current = this.internal
    for (let i = minByteOffset; i < tagLen; i++) current = current.parent
    for (let i = minByteOffset; i < tagLen; i++) current = current.child(id[i]!)
    return new TagMapSubsetCache(id, { ...this.tag, ...tag }, this.keys, current)
  }
}
class InternalTagMapSubsetCache<V> {
  children = new Map<number, InternalTagMapSubsetCache<V>>()
  parent: InternalTagMapSubsetCache<V>
  entries: InternalTagMapValues<V>[]

  constructor(parent: InternalTagMapSubsetCache<V>, entries: InternalTagMapValues<V>[]) {
    this.parent = parent
    this.entries = entries
  }

  child(id: number): InternalTagMapSubsetCache<V> {
    if (this.children.has(id)) return this.children.get(id)!
    const entries = this.entries.flatMap(x => x.subset(id))
    const cache = new InternalTagMapSubsetCache(this, entries)
    this.children.set(id, cache)
    return cache
  }
}
