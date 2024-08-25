import type { TagId, TagMapKeys } from './keys'
import type { Tag } from './type'

export type DedupTag<V = never> = Leaf<V>
/**
 * A group of deduplicated tags. `DedupTag`s of the same `Tag`
 * are guaranteed to be the same reference.
 */
export class DedupTags<V = never> {
  root = new Internal<V>(undefined!)
  keys: TagMapKeys
  empty: Leaf<V>

  constructor(keys: TagMapKeys) {
    this.keys = keys
    this.empty = this.at({})
  }

  /** Object associated with `tag` */
  at(tag: Tag): DedupTag<V> {
    const id = this.keys.get(tag)
    const cur = id.reduce((cur, id) => cur.child(id), this.root)
    if (!cur.leaf) cur.leaf = new Leaf(tag, id, this.keys, cur)
    return cur.leaf
  }
}

class Internal<V> {
  parent: Internal<V>
  children = new Map<number, Internal<V>>()
  leaf?: Leaf<V>

  constructor(parent: Internal<V>) {
    this.parent = parent
  }

  child(id: number): Internal<V> {
    let result = this.children.get(id)
    if (result) return result

    result = new Internal(this)
    this.children.set(id, result)
    return result
  }
}

class Leaf<V> {
  tag: Tag
  id: TagId
  val?: V

  keys: TagMapKeys
  internal: Internal<V>

  constructor(tag: Tag, id: TagId, keys: TagMapKeys, internal: Internal<V>) {
    this.tag = tag
    this.id = id
    this.keys = keys
    this.internal = internal
  }

  /** Object associated with tag `{ ...this.tag, tag }` */
  with(tag: Tag): Leaf<V> {
    const { id, firstReplacedByte: first } = this.keys.combine(this.id, tag)
    let cur = this.internal
    for (let i = first; i < this.keys.tagLen; i++) cur = cur.parent
    cur = id.slice(first).reduce((cur, id) => cur.child(id), cur)
    if (!cur.leaf)
      cur.leaf = new Leaf({ ...this.tag, ...tag }, id, this.keys, cur)
    return cur.leaf
  }
}
