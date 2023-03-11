import type { CompiledTagMapValues } from './compilation'
import type { TagID } from './keys'

export class TagMapExactValues<V> {
  internal: Internal<V>
  tagLen: number

  constructor(tagLen: number, compiled: CompiledTagMapValues<V>) {
    this.internal = new Internal(compiled)
    this.tagLen = tagLen
  }

  refExact(id: TagID): V[] {
    let current = this.internal
    const tagLen = this.tagLen
    for (let i = 0; i < tagLen; i++) current = current.exact(id[i]!)
    return current.values
  }
}

class Internal<V> {
  children: Map<number, Internal<V>>
  values: V[]

  constructor(compiled: CompiledTagMapValues<V>) {
    const { '': values, ...remaining } = compiled
    this.children = new Map()
    this.values = values ?? []

    for (const v of Object.values(remaining))
      for (const [k, vv] of Object.entries(v!))
        this.children.set(+k, new Internal(vv as CompiledTagMapValues<V>))
  }

  exact(id: number): Internal<V> {
    let result = this.children.get(id)
    if (result) return result

    result = new Internal({})
    this.children.set(id, result)
    return result
  }
}
