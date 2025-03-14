import { TagMapKeys } from './keys'
import { entryRef } from './symb'
import type { Tag, TagCategory, TagValue } from './type'

/**
 * Serializable data for `TagMapKeys`. The format is not stabilized.
 * Use `compileTagMapKeys` to construct a valid object.
 */
export type RawTagMapKeys = {
  tagLen: number
  data: Record<
    TagCategory,
    { offset: number; mask: number; ids: Record<TagValue, number> }
  >
}

/**
 * Serializable data for `TagMapSubsetValues`. The format is not
 * stabilized. Use `compileTagMapValues` to construct a valid object.
 */
export type RawTagMapValues<V> = {
  [key in string]?: RawTagMapValues<V>
} & { [entryRef]?: TagMapEntry<V>[] }

/** Uncompiled entry for `TagMap<V>` */
export type TagMapEntry<V, T = Tag> = { tag: T; value: V }
/** Uncompiled entries for `TagMap<V>` */
export type TagMapEntries<V, T = Tag> = TagMapEntry<V, T>[]

export function compileTagMapKeys(
  tags: readonly (
    | { category: TagCategory; values: Set<TagValue> }
    | undefined
  )[],
): RawTagMapKeys {
  const data: RawTagMapKeys['data'] = {}
  let byteOffset = 0,
    bitOffset = 0
  for (const tag of tags) {
    if (!tag) {
      byteOffset++
      bitOffset = 0
      continue
    }

    const values = [...new Set(tag.values)]
    const bitNeeded = 32 - Math.clz32(values.length)
    if (bitOffset + bitNeeded > 32) {
      byteOffset++
      bitOffset = 0
    }

    data[tag.category] = {
      offset: byteOffset,
      mask: ((1 << bitNeeded) - 1) << bitOffset,
      ids: Object.fromEntries(values.map((v, i) => [v, (i + 1) << bitOffset])),
    }
    bitOffset += bitNeeded
  }
  return { tagLen: byteOffset + 1, data }
}

export function compileTagMapValues<V>(
  _keys: RawTagMapKeys,
  entries: TagMapEntries<V>,
): RawTagMapValues<V> {
  const keys = new TagMapKeys(_keys),
    tagLen = keys.tagLen,
    result: RawTagMapValues<V> = {}
  for (const entry of entries) {
    const { id, mask } = keys.getMask(entry.tag)

    let current = result
    for (let i = 0; i < tagLen; i++) {
      const _id = id[i]!,
        _mask = mask[i]!
      if (!current[_mask]) current[_mask] = {}
      current = current[_mask] as RawTagMapValues<V>
      if (!current[_id]) current[_id] = {}
      current = current[_id] as RawTagMapValues<V>
    }
    if (!current[entryRef]) current[entryRef] = []
    current[entryRef].push(entry)
  }
  return result
}

export function mergeTagMapValues<V>(
  entries: RawTagMapValues<V>[],
): RawTagMapValues<V> {
  if (entries.length == 1) return entries[0]!
  const keys = new Set(entries.flatMap((entry) => Object.keys(entry)))
  const result: RawTagMapValues<V> = Object.fromEntries(
    [...keys].map((key) => [
      key,
      mergeTagMapValues(entries.map((e) => e[key]!).filter((x) => !!x)),
    ]),
  )
  const refs = entries.flatMap((e) => e[entryRef] ?? [])
  if (refs.length) result[entryRef] = refs
  return result
}
