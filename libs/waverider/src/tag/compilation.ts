import { TagMapKeys } from './keys'
import type { Tag, TagCategory, TagValue } from './type'

export type CompiledTagMapKeys = {
  tagLen: number
  data: Record<TagCategory, { offset: number, mask: number, ids: Record<TagValue, number> }>
}
export type CompiledTagMapValues<V> = {
  [key in string]?: CompiledTagMapValues<V>
} & { ''?: V[] }
export type RawTagMapEntries<V> = { tag: Tag, value: V }[]

export function compileTagMapKeys(tags: readonly ({ category: TagCategory, values: readonly TagValue[] } | undefined)[]): CompiledTagMapKeys {
  const data: CompiledTagMapKeys['data'] = {}
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

    data[tag.category] = {
      offset: byteOffset,
      mask: (1 << bitNeeded) - 1 << bitOffset,
      ids: Object.fromEntries(tag.values.map((v, i) => [v, (i + 1) << bitOffset]))
    }
    bitOffset += bitNeeded
  }
  return { tagLen: byteOffset + 1, data }
}

export function compileTagMapValues<V>(_keys: CompiledTagMapKeys, entries: RawTagMapEntries<V>): CompiledTagMapValues<V> {
  const keys = new TagMapKeys(_keys), tagLen = keys.tagLen, result: CompiledTagMapValues<V> = {}
  for (const { tag, value } of entries) {
    const { id, mask } = keys.getMask(tag)

    let current = result
    for (let i = 0; i < tagLen; i++) {
      const _id = id[i]!, _mask = mask[i]!
      if (!current[_mask]) current[_mask] = {}
      current = current[_mask] as CompiledTagMapValues<V>
      if (!current[_id]) current[_id] = {}
      current = current[_id] as CompiledTagMapValues<V>
    }
    if (!current['']) current[''] = []
    current[''].push(value)
  }
  return result
}

export function mergeTagMapValues<V>(entries: CompiledTagMapValues<V>[]): CompiledTagMapValues<V> {
  if (entries.length == 1) return entries[0]!
  const keys = new Set(entries.flatMap(entry => Object.keys(entry)))
  return Object.fromEntries([...keys].map(key => [
    key, key === ''
      ? entries.flatMap(e => e[key]!).filter(x => x) as any
      : mergeTagMapValues(entries.map(e => e[key]!).filter(x => x))
  ]))
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
  const values = compileTagMapValues(new TagMapKeys(keys), entries)
  return { keys, values }
}
