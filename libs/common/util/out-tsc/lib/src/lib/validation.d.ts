/**
 * Validates an array by checking if it is an array and if it contains
 * only valid values
 * @param obj - the array to validate
 * @param validKeys - the valid values
 * @param def - the default values
 */
export declare function validateArr<T>(obj: unknown, validKeys: readonly T[], def?: T[]): T[];
/**
 * Validates a value by checking if it is a valid value
 * @param val - the value to validate
 * @param validKeys - the valid values
 * @returns the valid value, or undefined
 */
export declare function validateValue<T>(val: unknown, validKeys: readonly T[]): T | undefined;
//# sourceMappingURL=validation.d.ts.map