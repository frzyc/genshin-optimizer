/**
 * Validates an array by checking if it is an array and if it contains
 * only valid values
 * @param obj - the array to validate
 * @param validKeys - the valid values
 * @param def - the default values
 */

export function validateArr<T>(
  obj: unknown,
  validKeys: readonly T[],
  def?: T[]
): T[] {
  if (!Array.isArray(obj)) return def ?? [...validKeys]
  return obj.filter((k) => validKeys.includes(k))
}

/**
 * Validates a value by checking if it is a valid value
 * @param val - the value to validate
 * @param validKeys - the valid values
 * @returns the valid value, or undefined
 */
export function validateValue<T>(
  val: unknown,
  validKeys: readonly T[]
): T | undefined {
  if (!validKeys.includes(val as T)) return undefined
  return val as T
}
