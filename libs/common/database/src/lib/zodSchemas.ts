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

export function zodBoolean(defaultValue = false) {
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

export function zodNumberRecord<K extends string>(
  keys: readonly K[],
  defaultValue = 0
): z.ZodType<Record<K, number>> {
  return z.preprocess(
    (val) => {
      const result: Record<string, number> = {}
      const obj =
        typeof val === 'object' && val !== null
          ? (val as Record<string, unknown>)
          : {}
      for (const key of keys) {
        result[key] =
          typeof obj[key] === 'number' ? (obj[key] as number) : defaultValue
      }
      return result
    },
    z.record(z.string(), z.number())
  ) as unknown as z.ZodType<Record<K, number>>
}

/**
 * Creates a Zod object schema from an array of keys with proper type inference.
 * Each key maps to the same value schema.
 *
 * Use this when you need `Record<SpecificKey, Value>` type inference.
 *
 * @example
 * const slotKeys = ['flower', 'plume', 'sands'] as const
 * const schema = zodTypedRecord(slotKeys, z.string().optional())
 * type Result = z.infer<typeof schema>
 * // Result = { flower: string | undefined; plume: string | undefined; sands: string | undefined }
 */
export function zodTypedRecord<K extends string, V extends z.ZodTypeAny>(
  keys: readonly K[],
  valueSchema: V
): z.ZodObject<{ [P in K]: V }> {
  const shape = Object.fromEntries(keys.map((k) => [k, valueSchema])) as {
    [P in K]: V
  }
  return z.object(shape)
}

/**
 * Creates a Zod object schema from an array of keys where each key can have
 * a different schema based on a factory function.
 *
 * Use this when you need `Record<SpecificKey, Value>` with per-key customization.
 *
 * @example
 * const slotKeys = ['flower', 'plume', 'sands'] as const
 * const schema = zodTypedRecordWith(slotKeys, (key) =>
 *   z.object({ level: z.number() }).catch({ level: key === 'flower' ? 0 : 20 })
 * )
 */
export function zodTypedRecordWith<K extends string, V extends z.ZodTypeAny>(
  keys: readonly K[],
  schemaFactory: (key: K) => V
): z.ZodObject<{ [P in K]: V }> {
  const shape = Object.fromEntries(keys.map((k) => [k, schemaFactory(k)])) as {
    [P in K]: V
  }
  return z.object(shape)
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
