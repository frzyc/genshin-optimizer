import type { Tag, TagCategory, TagValue } from '../type'
import { TagID, TagMapKeys } from './keys'

export type CompiledTagMapKeys = {
  tagLen: number
  data: Record<TagCategory, { offset: number, mask: number, mapping: Record<TagValue, number> }>
}
export type CompiledTagMapValues<V> = { mask: number, mapping: { id: number, values: CompiledTagMapValues<V> | V[] }[] }[]
export type RawTagMapEntries<V> = { tag: Tag, value: V }[]

export function compileTagMapKeys(tags: readonly ({ category: TagCategory, values: readonly TagValue[] } | undefined)[]): CompiledTagMapKeys {
  const result: CompiledTagMapKeys = { tagLen: 0, data: {} }, { data } = result
  let byteOffset = 0, bitOffset = 0
  for (const tag of tags) {
    if (!tag) {
      byteOffset++
      bitOffset = 0
      continue
    }

    const bitNeeded = 32 - Math.clz32(tag.values.length)
    if (bitOffset + bitNeeded > 32) {
      byteOffset++
      bitOffset = 0
    }

    const mask = (1 << bitNeeded) - 1 << bitOffset
    const mapping = Object.fromEntries(tag.values.map((v, i) => [v, (i + 1) << bitOffset]))
    data[tag.category] = { offset: byteOffset, mask, mapping }
    bitOffset += bitNeeded
  }
  result.tagLen = byteOffset + 1
  return result
}

export function compileTagMapValues<V>(compiledKeys: CompiledTagMapKeys, entries: RawTagMapEntries<V>): CompiledTagMapValues<V> {
  if (compiledKeys.tagLen === 0) throw new Error('Tag map keys must have at least one category')
  const keys = new TagMapKeys(compiledKeys)
  return _compileTagMapValues(entries.map(({ tag, value }) => ({ ...keys.getMask(tag), value })), 0, compiledKeys.tagLen) as CompiledTagMapValues<V>
}
type ValueEntry<V> = { id: TagID, mask: TagID, value: V }
function _compileTagMapValues<V>(entries: ValueEntry<V>[], offset: number, tagLen: number): CompiledTagMapValues<V> | V[] {
  if (offset === tagLen) return entries.map(v => v.value)

  const mapping = new Map<number, Map<number, ValueEntry<V>[]>>() // mapping[mask][id]
  for (const { id: _id, mask: _mask, value } of entries) {
    const mask = _mask[offset]!, id = _id[offset]!
    if (!mapping.has(mask)) mapping.set(mask, new Map())
    const idMap = mapping.get(mask)!
    if (!idMap.has(id)) idMap.set(id, [])
    const entries = idMap.get(id)!
    entries.push({ id: _id, mask: _mask, value })
  }
  return [...mapping].flatMap(([mask, mapping]) => ({ mask, mapping: [...mapping].map(([id, v]) => ({ id, values: _compileTagMapValues(v, offset + 1, tagLen) })) }))
}

export function mergeTagMapValues<V>(tagLen: 0, _entries: (CompiledTagMapValues<V> | V[])[]): V[]
export function mergeTagMapValues<V>(tagLen: number, _entries: (CompiledTagMapValues<V> | V[])[]): CompiledTagMapValues<V>
export function mergeTagMapValues<V>(tagLen: number, _entries: (CompiledTagMapValues<V> | V[])[]): CompiledTagMapValues<V> | V[] {
  if (tagLen === 0) return (_entries as V[][]).flat()

  const entries = _entries as CompiledTagMapValues<V>[]
  const result = new Map<number, Map<number, (CompiledTagMapValues<V> | V[])[]>>()
  for (const entry of entries) {
    for (const { mask, mapping } of entry) {
      if (!result.has(mask)) result.set(mask, new Map())
      const idMap = result.get(mask)!
      for (const { id, values } of mapping) {
        if (!idMap.has(id)) idMap.set(id, [])
        idMap.get(id)!.push(values)
      }
    }
  }
  return [...result].map(([mask, mapping]) => ({
    mask, mapping: [...mapping].map(([id, values]) =>
      ({ id, values: mergeTagMapValues(tagLen - 1, values) }))
  }))
}

export function compileTagMapEntries<V>(entries: RawTagMapEntries<V>): { keys: CompiledTagMapKeys, values: CompiledTagMapValues<V> } {
  const tags = new Map<string, Set<string>>()
  for (const { tag } of entries) {
    for (const [cat, val] of Object.entries(tag)) {
      if (val === null) continue
      if (!tags.has(cat)) tags.set(cat, new Set())
      tags.get(cat)!.add(val)
    }
  }
  const keys = compileTagMapKeys([...tags].map(([category, val]) => ({ category, values: [...val] })))
  const values = compileTagMapValues(keys, entries)
  return { keys, values }
}
