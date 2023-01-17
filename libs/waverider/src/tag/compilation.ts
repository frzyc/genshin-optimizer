import { CompiledTagMapKeys, CompiledTagMapValues, TagMap } from './map'
import type { Tag } from './type'

export type RawTagMapEntries<V> = { tag: Tag, value: V }[]

export function compileTagMapValues<V>(keys: CompiledTagMapKeys, entries: RawTagMapEntries<V>): CompiledTagMapValues<V> {
  const tagMap = new TagMap<V>(keys)
  for (const { tag, value } of entries)
    tagMap.add(tag, value)
  return tagMap.values.data
}
