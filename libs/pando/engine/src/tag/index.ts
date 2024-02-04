import type { RawTagMapKeys, RawTagMapValues } from './compilation'
import { TagMapKeys } from './keys'
import { TagMapSubsetValues } from './subset'
import type { Tag } from './type'

export * from './compilation'
export * from './exact'
export * from './keys'
export * from './subset'
export * from './type'

/** `TagMap` speciallized in finding entries with matching tags, ignoring extraneous tag categories in the entry tags. */
export class TagMapSubset<V> {
  keys: TagMapKeys
  values: TagMapSubsetValues<V>

  constructor(keys: RawTagMapKeys, values: RawTagMapValues<V>) {
    this.keys = new TagMapKeys(keys)
    this.values = new TagMapSubsetValues(keys.tagLen, values)
  }

  subset(tag: Tag): V[] {
    return this.values.subset(this.keys.get(tag))
  }
  cache() {
    return this.values.cache(this.keys)
  }
}
