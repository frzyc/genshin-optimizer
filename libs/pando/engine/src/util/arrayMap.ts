/** Map with array keys. Keys are equal if they have the same length, and every entry is pairwise equal according to `Map`'s key equality */
export class ArrayMap<Key, Value> {
  internal = new Internal<Key, Value>()

  ref(key: Key[]): { value?: Value } {
    return key.reduce((cur, key) => cur.get(key), this.internal)
  }

  *[Symbol.iterator](): Generator<[Key[], Value]> {
    for (const [key, ref] of this.internal.entries([]))
      if ('value' in ref) yield [[...key], ref.value!]
  }
  *values(): Generator<Value> {
    for (const ref of this.internal.allRefs())
      if ('value' in ref) yield ref.value!
  }
}

class Internal<Key, Value> {
  map = new Map<Key, Internal<Key, Value>>()
  value?: Value

  get(key: Key): Internal<Key, Value> {
    const old = this.map.get(key)
    if (old) return old
    const internal = new Internal<Key, Value>()
    this.map.set(key, internal)
    return internal
  }

  *allRefs(): Generator<Internal<Key, Value>> {
    for (const v of this.map.values()) yield* v.allRefs()
    yield this
  }
  /** CAUTION: the yielded `key` is the same object reference as `prefix` */
  *entries(prefix: Key[]): Generator<[Key[], Internal<Key, Value>]> {
    const keyIdx = prefix.push(undefined as any) - 1
    for (const [k, v] of this.map.entries()) {
      prefix[keyIdx] = k
      yield* v.entries(prefix)
    }
    prefix.pop()
    yield [prefix, this]
  }
}
