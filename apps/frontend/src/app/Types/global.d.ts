declare global {
  interface ObjectConstructor {
    export keys<K, V>(o: Record<K, V>): `${K}`[]
    export keys<K, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): `${K}`[]
    export values<K, V>(o: Partial<Record<K, V>> | Record<string, never>): V[]
    export values<K, V>(
      o: Record<K, Exclude<V, undefined>>
    ): Exclude<V, undefined>[]
    export entries<K, V>(
      o: Record<K, Exclude<V, undefined>>
    ): [`${K}`, Exclude<V, undefined>][]
    export entries<K, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): [`${K}`, V][]
  }
}

export {}
