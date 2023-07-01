import type { CompiledTagMapKeys, CompiledTagMapValues } from './compilation'
import { TagMapKeys } from './keys'
import { TagMapSubsetValues } from './subset'
import type { Tag } from './type'

export * from './compilation'
export * from './exact'
export * from './keys'
export * from './subset'
export * from './type'

export class TagMapSubset<V> {
  keys: TagMapKeys
  values: TagMapSubsetValues<V>

  constructor(keys: CompiledTagMapKeys, values: CompiledTagMapValues<V>) {
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
