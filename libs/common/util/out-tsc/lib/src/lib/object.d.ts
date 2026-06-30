export declare function crawlObject<T, O>(obj: Record<string, T> | T, keys: string[] | undefined, validate: (o: unknown, keys: string[]) => boolean, cb: (o: O, keys: string[]) => void): void;
export declare function crawlObjectAsync<T, O>(obj: Record<string, T> | T, keys: string[] | undefined, validate: (o: unknown, keys: string[]) => boolean, cb: (o: O, keys: string[]) => Promise<void>): Promise<void>;
export declare function layeredAssignment<T, Obj>(obj: Obj, keys: readonly (number | string)[], value: T): Obj;
/**
 * Filter the object to only have key:value for a correspoding array of keys
 * Assumes that `keys` is a superset of Object.keys(obj)
 * @param obj
 * @param keys
 * @returns
 */
export declare function objFilterKeys<K extends string, K2 extends string, V>(obj: Record<K, V>, keys: K2[]): Record<K2, V>;
/**
 * Filter an object's entries based on a predicate function
 * @param obj The object to filter
 * @param f Predicate function that takes (value, key, index)
 * @returns A new object containing only the entries that pass the predicate
 */
export declare function objFilter<K extends string | number, V>(obj: Record<K, V>, f: (v: V, k: K, i: number) => boolean): Record<K, V>;
export declare function objFilter<K extends string | number, V>(obj: Partial<Record<K, V>>, f: (v: V, k: K, i: number) => boolean): Partial<Record<K, V>>;
export declare function objMap<K extends string | number, V, V2>(obj: Record<K, V>, f: (v: V, k: K, i: number) => V2): Record<K, V2>;
export declare function objMap<K extends string | number, V, V2>(obj: Partial<Record<K, V>>, f: (v: V, k: K, i: number) => V2): Partial<Record<K, V2>>;
/**
 * Generate an object from an array of keys, and a function that maps the key to a value
 * @param keys
 * @param map
 * @returns
 */
export declare function objKeyMap<K extends string | number, V>(keys: readonly K[], map: (key: K, i: number) => V): Record<K, V>;
export declare function objKeyValMap<K, K2 extends string | number, V>(items: readonly K[], map: (item: K, i: number) => [K2, V]): Record<K2, V>;
export declare function objMultiplication(obj: Record<string, unknown>, multi: number): Record<string, unknown>;
export declare function deletePropPath(obj: Record<string, unknown>, path: readonly string[]): void;
export declare function objPathValue(obj: object | undefined, keys: readonly string[]): any;
export declare function objClearEmpties(o: Record<string, unknown>): void;
export declare const getObjectKeysRecursive: (obj: unknown) => string[];
export declare function deepFreeze<T>(obj: T, layers?: number): T;
export declare class ObjNotMatchError extends Error {
    readonly extraKeys: string[];
    readonly missingKeys: string[];
    constructor(extraKeys: string[], missingKeys: string[], message?: string);
}
/**
 * Checks if an object has exactly the keys provided.
 * Narrows the object type using a type predicate on success.
 * Throws an error otherwise
 * @param obj Object to check
 * @param keys Exact keys to be present in the object
 */
export declare function verifyObjKeys<K extends string, V>(obj: Partial<Record<K, V>>, keys: readonly K[]): asserts obj is Record<K, V>;
export declare function extraneousObjKeys<K extends string, V>(obj: Partial<Record<K, V>>, keys: readonly K[]): string[];
export declare function missingObjKeys<K extends string, V>(obj: Partial<Record<K, V>>, keys: readonly K[]): K[];
/**
 * reverses the keys and values of an object
 */
export declare function reverseMap<K extends string, V extends string>(obj: Record<K, V>): Record<V, K>;
export declare function shallowCompareObj<T extends Record<string, any>>(obj1: T, obj2: T): boolean;
export declare function objFindValue<K extends string, V extends string>(obj: Record<K, V>, value: V): K | undefined;
/**
 * Returns a new object that is the sum of `a` and `b`
 */
export declare function objSum(a: Record<string, number>, b: Record<string, number>): Record<string, number>;
/**
 * Apply obj `add` to the `base` object
 */
export declare function objSumInPlace(base: Record<string, number>, add: Record<string, number>): Record<string, number>;
export declare function prettify(obj: object | undefined): string;
/**
 * Removes all fields from an object whose values are `undefined`, in place.
 *
 * @param obj - The object from which `undefined` fields should be removed.
 * @returns `obj` with all `undefined` fields removed.
 */
export declare function removeUndefinedFields<K extends string, V>(obj: Record<K, V>): Record<K, V>;
//# sourceMappingURL=object.d.ts.map