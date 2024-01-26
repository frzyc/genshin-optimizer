declare global {
  interface ObjectConstructor {
    keys<K extends string | number, V>(o: Partial<Record<K, V>>): `${K}`[]
    keys<K extends string | number, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): `${K}`[]
    values<K extends string | number, V>(o: Record<K, V>): V[]
    values<K extends string | number, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): V[]
    entries<K extends string | number, V>(o: Record<K, V>): [`${K}`, V][]
    entries<K extends string | number, V>(
      o: Partial<Record<K, V>> | Record<string, never>
    ): [`${K}`, V][]
    fromEntries<K extends string | number, T = any>(
      entries: Iterable<readonly [K, T]>
    ): Record<K, T>
  }
}

export {}
