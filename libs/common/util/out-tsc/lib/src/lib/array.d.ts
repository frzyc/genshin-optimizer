export declare function getArrLastElement<E>(arr: E[]): E | null;
/** range of [from, to], inclusive */
export declare function range(from: number, to: number, step?: number): number[];
/** Will change `arr` in-place */
export declare function toggleInArr<T>(arr: T[], value: T): T[];
export declare function cartesian<T>(...q: T[][]): T[][];
export declare function toggleArr<T>(arr: T[], value: T): T[];
export declare function arrayMove<T>(arr: T[], oldIndex: number, newIndex: number): T[];
export declare function transposeArray<T>(arr: T[][]): T[][];
export declare function linspace(start: number, stop: number, num: number, inclusiveEnd?: boolean): number[];
/** Intended to use with array.filter function to type check against Array<TValue|undefined> -> Array<TValue> */
export declare function notEmpty<T>(value: T | null | undefined | ''): value is T;
/**
 * Allow a "smart" toggling of elements within an array.
 * @param allKeys
 * @returns
 */
export declare function handleMultiSelect<T>(allKeys: T[]): (arr: T[], v: T) => T[];
/**
 * Shorten or pad an array to a certain length, with a default value.
 * Modifies the array in-place.
 * @param array
 * @param length
 * @param value
 * @returns The modified array
 */
export declare function pruneOrPadArray<T>(array: T[], length: number, value: T): T[];
/**
 * Move an element in the array to the front, if it exists.
 * @param arr
 * @param key
 * @returns
 */
export declare function moveToFront<T>(arr: T[], key: T): T[];
//# sourceMappingURL=array.d.ts.map