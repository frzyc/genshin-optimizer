import { isDebug } from '../util'
import type { RawTagMapValues } from './compilation'
import type { TagID } from './keys'
import { entryKey, entryVal } from './symb'
import type { Tag } from './type'

type Leaf<V> = { [entryVal]: V[]; [entryKey]?: Tag[] }

/**
 * `TagMap` specialized in finding entries with matching tags, ignoring
 * extraneous tag categories in the entry tags. Operates on `TagID`
 * instead of `Tag`.
 */
export class TagMapSubsetValues<V> {
  root: Internal<V>

  constructor(tagLen: number, compiled: RawTagMapValues<V>) {
    this.root = new Internal(tagLen, compiled)
  }

  subset(id: TagID): V[] {
    const result: V[] = []
    this._subset(id, (l) => result.push(...l[entryVal]))
    return result
  }
  debugTag(id: TagID): Tag[] {
    if (isDebug('tag_db'))
      throw new Error('Entry tags are only tracked in debug mode')
    const result: Tag[] = []
    this._subset(id, (l) => result.push(...l[entryKey]!))
    return result
  }

  _subset(id: TagID, callback: (_: Leaf<V>) => void): void {
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
          map.set(+id, new Internal(remLen - 1, vv as RawTagMapValues<V>))
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
