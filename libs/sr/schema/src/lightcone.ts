import {
  zodBoolean,
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import {
  type AscensionKey,
  type SuperimposeKey,
  allLightConeKeys,
  allLocationKeys,
  lightConeMaxLevel,
  validateLevelAsc,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'

const lightConeBaseSchema = z
  .object({
    key: zodEnum(allLightConeKeys),
    level: zodBoundedNumber(1, lightConeMaxLevel, 1),
    ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
    superimpose: zodClampedNumber(1, 5, 1) as z.ZodType<SuperimposeKey>,
    location: zodEnumWithDefault(allLocationKeys, ''),
    lock: zodBoolean(),
  })
  .passthrough()

export const lightConeSchema = z
  .preprocess(
    (obj) => ({
      ...(typeof obj === 'object' && obj !== null ? obj : {}),
      _rawLevel: (obj as { level?: unknown })?.level,
    }),
    lightConeBaseSchema
  )
  .refine(
    (data) => {
      const rawLevel = (data as { _rawLevel?: unknown })._rawLevel
      if (typeof rawLevel !== 'number') return true
      return rawLevel <= lightConeMaxLevel
    },
    { message: 'Level exceeds max' }
  )
  .transform((data) => {
    const { level, ascension } = validateLevelAsc(data.level, data.ascension)

    return {
      ...data,
      level,
      ascension,
    }
  })

export type ILightCone = z.infer<typeof lightConeSchema>

export function parseLightCone(obj: unknown): ILightCone | undefined {
  const result = lightConeSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
