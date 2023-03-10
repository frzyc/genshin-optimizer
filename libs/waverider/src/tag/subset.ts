import type { Tag } from './type'
import type { CompiledTagMapValues } from './compilation'
import type { TagID, TagMapKeys } from './keys'

export type TagMapSubsetCache<V> = Cache<V>
export class TagMapSubsetValues<V> {
  internal: Internal<V>
  tagLen: number

  constructor(tagLen: number, compiled: CompiledTagMapValues<V>) {
    this.internal = new Internal(compiled)
    this.tagLen = tagLen
  }

  allValues(): V[] {
    const result: V[] = [],
      tagLen = this.tagLen
    function crawl(v: Internal<V>, offset: number): void {
      if (offset === tagLen) result.push(...v.values)
      else v.children.forEach((v) => v.forEach((v) => crawl(v, offset + 1)))
    }
    return crawl(this.internal, 0), result
  }
  subset(id: TagID): V[] {
    const result: V[] = [],
      tagLen = this.tagLen
    function crawl(v: Internal<V>, offset: number): void {
      if (offset === tagLen) result.push(...v.values)
      else v.subset(id[offset]!).forEach((v) => crawl(v, offset + 1))
    }
    return crawl(this.internal, 0), result
  }

  cache(keys: TagMapKeys): Cache<V> {
    const tagLen = keys.tagLen
    let last = new InternalCache(undefined as any, [this.internal])
    for (let i = 0; i < tagLen; i++) last = last.child(0)
    return new Cache<V>(new Int32Array(tagLen).fill(0), {}, keys, last)
  }
}

class Internal<V> {
  children: Map<number, Map<number, Internal<V>>>
  values: V[]

  constructor(compiled: CompiledTagMapValues<V>) {
    const { '': values, ...remaining } = compiled
    this.children = new Map()
    this.values = values ?? []

    for (const [k, v] of Object.entries(remaining)) {
      const map = new Map<number, Internal<V>>()
      this.children.set(+k, map)
      for (const [k, vv] of Object.entries(v!))
        map.set(+k, new Internal(vv as CompiledTagMapValues<V>))
    }
  }

  subset(id: number): Internal<V>[] {
    return [...this.children]
      .map(([mask, mapping]) => mapping.get(id & mask)!)
      .filter((x) => x)
  }
}

class Cache<V> {
  id: Int32Array
  tag: Tag
  keys: TagMapKeys
  tagLen: number
  internal: InternalCache<V>

  constructor(
    id: TagID,
    tag: Tag,
    keys: TagMapKeys,
    internal: InternalCache<V>
  ) {
    this.id = id
    this.tag = tag
    this.keys = keys
    this.tagLen = keys.tagLen
    this.internal = internal
  }

  subset(): V[] {
    return this.internal.entries.flatMap((x) => x.values)
  }
  with(tag: Tag): Cache<V> {
    const { tagLen } = this.keys,
      { id, firstReplacedByte: first } = this.keys.combine(this.id, tag)

    let current = this.internal
    for (let i = first; i < tagLen; i++) current = current.parent
    for (let i = first; i < tagLen; i++) current = current.child(id[i]!)
    return new Cache(id, { ...this.tag, ...tag }, this.keys, current)
  }
}
class InternalCache<V> {
  children = new Map<number, InternalCache<V>>()
  entries: Internal<V>[]
  parent: InternalCache<V>

  constructor(parent: InternalCache<V>, entries: Internal<V>[]) {
    this.entries = entries
    this.parent = parent
  }

  child(id: number): InternalCache<V> {
    const result = this.children.get(id)
    if (result) return result

    const entries = this.entries.flatMap((x) => x.subset(id))
    const cache = new InternalCache(this, entries)
    this.children.set(id, cache)
    return cache
  }
}
