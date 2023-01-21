import tagBitList from './bitList.gen.json'
import type { RawTagMapEntries } from './compilation'
import { CompiledTagMapKeys, TagMap } from './map'
import type { Tag, TagCategory, TagValue } from './type'

/** Uses of this beyond debugging and testing is discouraged due to large overhead */
export function tagMapFromEntries<V>(entries: RawTagMapEntries<V>): TagMap<V> {
  const keys = compileTagMapKeys(entries.map(x => x.tag), [])
  const tagMap = new TagMap<V>(keys)
  for (const { tag, value } of entries)
    tagMap.add(tag, value)
  return tagMap
}

// This function is separated from the rest of the project due to its complexity.
// It relies on `tagBitList`, which can grow very large as the demand increases.

export function compileTagMapKeys(tags: Tag[], tagOrder: TagCategory[]): CompiledTagMapKeys {
  const foundTags: Record<TagCategory, Set<TagValue>> = {}
  for (const tag of tags)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null) continue
      if (category in foundTags) foundTags[category]!.add(value)
      else foundTags[category] = new Set([value])
    }

  // Allow custom tag ordering so that one can optimize the lookup process
  const entries: CompiledTagMapKeys['data'] = {}, knownOrders = new Set(tagOrder)
  tagOrder = [...knownOrders, ...Object.keys(foundTags).filter(key => !knownOrders.has(key))]
  let offset = 0, bitUsed = 0
  for (const category of tagOrder) {
    const values = foundTags[category]
    if (!values) continue

    const valueSize = values.size, bitCount = tagBitList.findIndex(x => x.length >= valueSize)
    if (bitCount <= 0) throw new Error("Insufficient Tag Dictionary")
    const bits = tagBitList[bitCount]!

    // JS bitwise operations operate on 32-bit integers
    if (bitCount + bitUsed > 32) {
      offset += 1
      bitUsed = 0
    }
    entries[category] = {
      offset, mapping: Object.fromEntries(
        [...values].map((v, i) => [v, bits[i]! << bitUsed]))
    }
    bitUsed += bitCount
  }

  return { tagLen: offset + 1, data: entries }
}
