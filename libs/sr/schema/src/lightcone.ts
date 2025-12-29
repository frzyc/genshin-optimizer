import {
  zodBoolean,
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import type { AscensionKey, SuperimposeKey } from '@genshin-optimizer/sr/consts'
import {
  allLightConeKeys,
  allLocationKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'

export const lightConeSchema = z.object({
  key: zodEnum(allLightConeKeys),
  level: zodBoundedNumber(1, lightConeMaxLevel, 1),
  ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
  superimpose: zodClampedNumber(1, 5, 1) as z.ZodType<SuperimposeKey>,
  location: zodEnumWithDefault(allLocationKeys, ''),
  lock: zodBoolean({ coerce: true }),
})

export type ILightCone = z.infer<typeof lightConeSchema>

export function parseLightCone(obj: unknown): ILightCone | undefined {
  const result = lightConeSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
