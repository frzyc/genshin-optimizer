declare global {
  interface ObjectConstructor {
    keys<K extends string | number, V>(o: Partial<Record<K, V>>): `${K}`[]
    keys<K extends string | number, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): `${K}`[]
    values<K extends string | number, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): V[]
    values<K extends string | number, V>(
      o: Record<K, Exclude<V, undefined>>
    ): Exclude<V, undefined>[]
    entries<K extends string | number, V>(
      o: Record<K, Exclude<V, undefined>>
    ): [`${K}`, Exclude<V, undefined>][]
    entries<K extends string | number, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): [`${K}`, V][]
  }
}

export {}
