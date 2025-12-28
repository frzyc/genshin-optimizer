import { z } from 'zod'

/**
 * Create an enum schema from a readonly array.
 * Fails validation if value is not in the array.
 */
export function zodEnum<T extends string>(values: readonly T[]) {
  return z.enum(values as unknown as [T, ...T[]])
}

/**
 * Create an enum schema with a fallback default value.
 * Uses preprocess to convert invalid values to the default.
 */
export function zodEnumWithDefault<T extends string>(
  values: readonly T[],
  defaultValue: T
) {
  return z.preprocess(
    (val) => (values.includes(val as T) ? val : defaultValue),
    z.enum(values as unknown as [T, ...T[]])
  )
}

/**
 * Create a bounded number schema with min/max and a fallback.
 * Returns fallback if value is not a number or out of bounds.
 */
export function zodBoundedNumber(min: number, max: number, fallback: number) {
  return z.preprocess((val) => {
    if (typeof val !== 'number' || !Number.isFinite(val)) return fallback
    if (val < min || val > max) return fallback
    return val
  }, z.number().min(min).max(max))
}

/**
 * Create a number schema with clamp (value is clamped to min/max instead of rejected).
 */
export function zodClampedNumber(min: number, max: number, fallback: number) {
  return z.preprocess((val) => {
    if (typeof val !== 'number' || !Number.isFinite(val)) return fallback
    return Math.max(min, Math.min(max, val))
  }, z.number())
}

/**
 * Create a boolean schema.
 * @param options - Configuration options
 *   - coerce: If true, uses !!val coercion (1 → true, 0 → false).
 *   - defaultValue: Value to use for non-boolean types (default: false).
 */
export function zodBoolean(
  options: { coerce?: boolean; defaultValue?: boolean } | boolean = {}
) {
  // Support old API: zodBoolean(true) means coerce mode
  if (typeof options === 'boolean') {
    options = { coerce: options }
  }
  const { coerce = false, defaultValue = false } = options
  return z.preprocess(
    (val) => (coerce ? !!val : typeof val === 'boolean' ? val : defaultValue),
    z.boolean()
  )
}

/**
 * Create an array schema that filters to only valid values.
 * If input is not an array, returns the defaultValue.
 * Empty arrays are preserved as empty (not replaced with defaults).
 * @param validKeys - Array of valid values to filter against
 * @param defaultValue - Default value if input is not an array
 *                       (defaults to all validKeys if not provided)
 */
export function zodFilteredArray<T>(
  validKeys: readonly T[],
  defaultValue?: readonly T[]
): z.ZodType<T[]> {
  const def: T[] = defaultValue ? [...defaultValue] : [...validKeys]
  return z.preprocess((val): T[] => {
    if (!Array.isArray(val)) return def
    // Filter to only valid values, preserving empty arrays
    return val.filter((k) => validKeys.includes(k as T)) as T[]
  }, z.array(z.any())) as z.ZodType<T[]>
}

/**
 * Create a schema for numeric literal unions (e.g., 1 | 2 | 3 | 4 | 5).
 * Zod's z.enum() only works with strings, so this uses refine for numbers.
 */
export function zodNumericLiteral<T extends readonly number[]>(values: T) {
  return z.number().refine((val): val is T[number] => values.includes(val), {
    message: `Must be one of: ${values.join(', ')}`,
  })
}

/**
 * Create an optional string schema with a default.
 */
export function zodString(fallback = '') {
  return z.preprocess(
    (val) => (typeof val === 'string' ? val : fallback),
    z.string()
  )
}
