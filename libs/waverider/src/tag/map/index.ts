import type { Tag } from '../type'
import { createSubsetCache, TagMapSubsetCache } from './cache'
import { CompiledTagMapKeys, CompiledTagMapValues } from './compilation'
import { TagMapKeys } from './keys'
import { TagMapValues } from './values'

export { CompiledTagMapKeys, CompiledTagMapValues, compileTagMapKeys, compileTagMapValues, RawTagMapEntries } from './compilation'
export { TagID, TagMapKeys } from './keys'
export { TagMapValues } from './values'

export class TagMap<V> {
  keys: TagMapKeys
  values: TagMapValues<V>

  constructor(keys: CompiledTagMapKeys, values: CompiledTagMapValues<V>) {
    this.keys = new TagMapKeys(keys)
    this.values = new TagMapValues(keys.tagLen, values)
  }

  allValues(): V[] { return this.values.allValues() }
  subset(tag: Tag): V[] { return this.values.subset(this.keys.get(tag)) }
  refExact(tag: Tag): V[] {
    const { id, mask } = this.keys.getMask(tag)
    return this.values.refExact(id, mask)
  }

  cacheSubset(): TagMapSubsetCache<V> { return createSubsetCache(this.keys, this.values) }
}
