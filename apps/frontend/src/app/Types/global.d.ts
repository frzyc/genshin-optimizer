declare global {
  type Displayable = string | JSX.Element
  type Dict<K extends string | number, V> = Partial<Record<K, V>>
  type StrictDict<K extends string | number, V> = Record<K, V>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type TransObject = any

  interface ObjectConstructor {
    export keys<K, V>(o: StrictDict<K, V>): `${K}`[]
    export keys<K, V>(o: Dict<K, V> | Record<string, never>): `${K}`[]
    export values<K, V>(o: Dict<K, V> | Record<string, never>): V[]
    export values<K, V>(
      o: StrictDict<K, Exclude<V, undefined>>
    ): Exclude<V, undefined>[]
    export entries<K, V>(
      o: StrictDict<K, Exclude<V, undefined>>
    ): [`${K}`, Exclude<V, undefined>][]
    export entries<K, V>(o: Dict<K, V> | Record<string, never>): [`${K}`, V][]
  }
}

export {}
