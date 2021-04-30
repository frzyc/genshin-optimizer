
declare global {
    type Displayable = string | JSX.Element
    type Dict<K extends string | number, V> = {
        [key in K]?: V
    }
    type StrictDict<K extends string | number, V> = {
        [key in K]: V
    }

    interface ObjectConstructor {
        export keys<K, V>(o: Dict<K, V> | {}): K extends number ? string[] : K[]
        export values<K, V>(o: Dict<K, V> | {}): V[]
        export entries<K, V>(o: Dict<K, V> | {}): [K extends number ? string : K, V][]

        export keys<K, V>(o: StrictDict<K, V> | {}): K extends number ? string[] : K[]
        export values<K, V>(o: StrictDict<K, V> | {}): V[]
        export entries<K, V>(o: StrictDict<K, V> | {}): [K extends number ? string : K, V][]
    }
}

export {
    Dict,
    Displayable,
    ObjectConstructor,
}