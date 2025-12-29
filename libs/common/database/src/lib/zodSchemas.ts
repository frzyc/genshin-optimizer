import { z } from 'zod'

export function zodEnum<T extends string>(values: readonly T[]) {
  return z.enum(values as unknown as [T, ...T[]])
}

export function zodEnumWithDefault<T extends string>(
  values: readonly T[],
  defaultValue: T
) {
  return z.enum(values as unknown as [T, ...T[]]).catch(defaultValue)
}

export function zodBoundedNumber(min: number, max: number, fallback: number) {
  return z.number().min(min).max(max).catch(fallback)
}

export function zodClampedNumber(min: number, max: number, fallback: number) {
  return z
    .number()
    .catch(fallback)
    .transform((val) => Math.max(min, Math.min(max, val)))
}

export function zodBoolean(
  options: { coerce?: boolean; defaultValue?: boolean } | boolean = {}
) {
  if (typeof options === 'boolean') {
    options = { coerce: options }
  }
  const { coerce, defaultValue = false } = options
  if (coerce) {
    return z.preprocess((val) => !!val, z.boolean())
  }
  return z.boolean().catch(defaultValue)
}

export function zodFilteredArray<T>(
  validKeys: readonly T[],
  defaultValue?: readonly T[]
): z.ZodType<T[]> {
  const def: T[] = defaultValue ? [...defaultValue] : [...validKeys]
  return z
    .array(z.any())
    .catch(def)
    .transform((arr) =>
      arr.filter((k) => validKeys.includes(k as T))
    ) as z.ZodType<T[]>
}

export function zodNumericLiteral<T extends readonly number[]>(values: T) {
  return z.number().refine((val): val is T[number] => values.includes(val), {
    message: `Must be one of: ${values.join(', ')}`,
  })
}

export function zodString(fallback = '') {
  return z.string().catch(fallback)
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

export function zodNumericLiteralWithDefault<T extends readonly number[]>(
  values: T,
  defaultValue: T[number]
) {
  return zodNumericLiteral(values).catch(defaultValue)
}

export function zodArray<T extends z.ZodTypeAny>(
  schema: T,
  fallback: z.infer<T>[] = []
) {
  return z.array(schema).catch(fallback)
}

export function zodObject<T extends z.ZodRawShape>(shape: T) {
  return z.looseObject({}).catch({}).pipe(z.object(shape))
}

export function zodObjectSchema<T extends z.ZodTypeAny>(schema: T) {
  return z
    .looseObject({})
    .catch({})
    .pipe(schema as unknown as z.ZodObject<z.ZodRawShape>)
    .transform((val) => val as z.infer<T>)
}
