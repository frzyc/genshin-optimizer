/** Map with array keys. Keys are equal if they have the same length, and every entry is pairwise equal according to `Map`'s key equality */
export declare class ArrayMap<Key, Value> {
    internal: Internal<Key, Value>;
    ref(key: Key[]): {
        value?: Value;
    };
    [Symbol.iterator](): Generator<[Key[], Value]>;
    values(): Generator<Value>;
}
declare class Internal<Key, Value> {
    map: Map<Key, Internal<Key, Value>>;
    value?: Value;
    get(key: Key): Internal<Key, Value>;
    allRefs(): Generator<Internal<Key, Value>>;
    /** CAUTION: the yielded `key` is the same object reference as `prefix` */
    entries(prefix: Key[]): Generator<[Key[], Internal<Key, Value>]>;
}
export {};
//# sourceMappingURL=arrayMap.d.ts.map