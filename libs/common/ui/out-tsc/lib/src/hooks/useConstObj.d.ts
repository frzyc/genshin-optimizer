/**
 * Will "retain" the reference to the same object,
 * as long as the serialized representation remains the same.
 * @param objInput Input to remain constant
 * @returns a state reference to the `objInput`,
 * static as long as the JSON stringlization of `objInput`
 * remains the same(even if the reference is different).
 */
export declare function useConstObj<T extends object | undefined>(objInput: T): T;
//# sourceMappingURL=useConstObj.d.ts.map