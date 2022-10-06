declare global {
  type Displayable = string | JSX.Element
  type Dict<K extends string | number, V> = Partial<Record<K, V>>
  type StrictDict<K extends string | number, V> = Record<K, V>

  interface ObjectConstructor {
    export keys<K, V>(o: StrictDict<K, V>): `${K}`[]
    export values<K, V>(o: StrictDict<K, Exclude<V, undefined>>): Exclude<V, undefined>[]
    export entries<K, V>(o: StrictDict<K, Exclude<V, undefined>>): [`${K}`, Exclude<V, undefined>][]

    export keys<K, V>(o: Dict<K, V> | {}): `${K}`[]
    export values<K, V>(o: Dict<K, V> | {}): V[]
    export entries<K, V>(o: Dict<K, V> | {}): [`${K}`, V][]
  }
}

export { }
