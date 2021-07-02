
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

    type CacheMode = {
        load?: boolean, // Use old value, if existed
        store?: boolean, // Save new value to database, if compute new value
    }
}

export {
    Dict,
    Displayable,
    ObjectConstructor,
}