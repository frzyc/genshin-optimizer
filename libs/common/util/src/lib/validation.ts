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

/**
 * This code validates the given object by using the given functions to validate the keys and values.
 * The function returns a new object that contains only the valid keys and values.
 * @param obj The object to validate
 * @param vKey The function to validate the keys
 * @param vEntry The function to validate the values
 * @returns a new object that contains only the valid keys and values
 */
export function validateObject(
  obj: unknown,
  vKey: (k: string) => boolean,
  vEntry: (o: unknown) => boolean
) {
  if (typeof obj !== 'object') return {}
  return Object.fromEntries(
    Object.entries(obj as object).filter(([k, e]) => vKey(k) && vEntry(e))
  )
}
