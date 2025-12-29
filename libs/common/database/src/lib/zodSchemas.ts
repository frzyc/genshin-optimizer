import { z } from 'zod'

export function zodEnum<T extends string>(values: readonly T[]) {
  return z.enum(values as unknown as [T, ...T[]])
}

export function zodEnumWithDefault<T extends string>(
  values: readonly T[],
  defaultValue: T
) {
  return z.preprocess(
    (val) => (values.includes(val as T) ? val : defaultValue),
    z.enum(values as unknown as [T, ...T[]])
  )
}

export function zodBoundedNumber(min: number, max: number, fallback: number) {
  return z.preprocess((val) => {
    if (typeof val !== 'number' || !Number.isFinite(val)) return fallback
    if (val < min || val > max) return fallback
    return val
  }, z.number().min(min).max(max))
}

export function zodClampedNumber(min: number, max: number, fallback: number) {
  return z.preprocess((val) => {
    if (typeof val !== 'number' || !Number.isFinite(val)) return fallback
    return Math.max(min, Math.min(max, val))
  }, z.number())
}

export function zodBoolean(
  options: { coerce?: boolean; defaultValue?: boolean } | boolean = {}
) {
  if (typeof options === 'boolean') {
    options = { coerce: options }
  }
  const { coerce = false, defaultValue = false } = options
  return z.preprocess(
    (val) => (coerce ? !!val : typeof val === 'boolean' ? val : defaultValue),
    z.boolean()
  )
}

export function zodFilteredArray<T>(
  validKeys: readonly T[],
  defaultValue?: readonly T[]
): z.ZodType<T[]> {
  const def: T[] = defaultValue ? [...defaultValue] : [...validKeys]
  return z.preprocess((val): T[] => {
    if (!Array.isArray(val)) return def
    return val.filter((k) => validKeys.includes(k as T)) as T[]
  }, z.array(z.any())) as z.ZodType<T[]>
}

export function zodNumericLiteral<T extends readonly number[]>(values: T) {
  return z.number().refine((val): val is T[number] => values.includes(val), {
    message: `Must be one of: ${values.join(', ')}`,
  })
}

export function zodString(fallback = '') {
  return z.preprocess(
    (val) => (typeof val === 'string' ? val : fallback),
    z.string()
  )
}

export function zodBooleanRecord<K extends string | number>(
  keys: readonly K[]
): z.ZodType<Partial<Record<K, boolean>>> {
  return z.preprocess(
    (val) => {
      const result: Partial<Record<K, boolean>> = {}
      if (typeof val !== 'object' || val === null) return result
      const obj = val as Record<string | number, unknown>
      for (const key of keys) {
        if (typeof obj[key] === 'boolean') result[key] = obj[key]
      }
      return result
    },
    z.record(z.union([z.string(), z.number()]), z.boolean())
  ) as unknown as z.ZodType<Partial<Record<K, boolean>>>
}
