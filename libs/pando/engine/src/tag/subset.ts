import type { RawTagMapValues, TagMapEntries, TagMapEntry } from './compilation'
import type { TagId } from './keys'
import { entryRef } from './symb'

type Leaf<V> = { [entryRef]: TagMapEntry<V>[] }

/**
 * `TagMap` specialized in finding entries with matching tags, ignoring
 * extraneous tag categories in the entry tags. Operates on `TagId`
 * instead of `Tag`.
 */
export class TagMapSubsetValues<V> {
  root: Internal<V>

  constructor(tagLen: number, compiled: RawTagMapValues<V>) {
    this.root = new Internal(tagLen, compiled)
  }

  /** All entry values whose tags matching `id`. Missing entry tag categories are ignored */
  subset(id: TagId): V[] {
    const result: V[] = []
    this._subset(id, (l) => result.push(...l[entryRef].map((v) => v.value)))
    return result
  }
  /** All entries whose tags matching `id`. Missing entry tag categories are ignored */
  entries(id: TagId): TagMapEntries<V> {
    const result: TagMapEntries<V> = []
    this._subset(id, (l) => result.push(...l[entryRef]))
    return result
  }

  _subset(id: TagId, callback: (_: Leaf<V>) => void): void {
    const len = id.length
    function crawl(idx: number, internal: Internal<V>) {
      if (idx < len) internal.subset(id[idx]).forEach((i) => crawl(idx + 1, i))
      else callback(internal.leaf!)
    }
    crawl(0, this.root)
  }
}

class Internal<V> {
  children: { mask: number; map: Map<number, Internal<V>> }[] = []
  leaf?: Leaf<V>

  constructor(remLen: number, vals: RawTagMapValues<V>) {
    if (remLen > 0) {
      for (const [mask, v] of Object.entries(vals)) {
        const map = new Map<number, Internal<V>>()
        for (const [id, vv] of Object.entries(v!))
          map.set(+id, new Internal(remLen - 1, vv!))
        this.children.push({ mask: +mask, map })
      }
    } else this.leaf = vals as Leaf<V>
  }

  subset(id: number): Internal<V>[] {
    return this.children
      .map(({ mask, map }) => map.get(id & mask))
      .filter((x) => !!x)
  }
}
