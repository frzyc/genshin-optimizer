export declare function evalIfFunc<T, X extends unknown[]>(value: T | ((...args: X) => T), ...args: X): T;
export declare function assertUnreachable(value: never): never;
/**
 * Assumes that the object entries are all primitives + objects
 * shallow copy the object,
 * deep copy the
 * @param obj
 * @returns
 */
export declare function deepClone<T>(obj: T): T;
export declare function isIn<T>(values: readonly T[], val: any): val is T;
export declare function nameToKey(name: string): string;
//# sourceMappingURL=util.d.ts.map