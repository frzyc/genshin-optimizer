import {
  zodBoolean,
  zodBoundedNumber,
  zodEnum,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import {
  type MilestoneKey,
  type PhaseKey,
  allLocationKeys,
  allWengineKeys,
  validateLevelMilestone,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

export const wengineBaseSchema = z.object({
  key: zodEnum(allWengineKeys),
  level: zodBoundedNumber(1, wengineMaxLevel, 1),
  phase: zodBoundedNumber(1, 5, 1) as z.ZodType<PhaseKey>,
  modification: zodBoundedNumber(0, 5, 0) as z.ZodType<MilestoneKey>,
  location: zodEnumWithDefault(allLocationKeys, ''),
  lock: zodBoolean(),
})

export const wengineSchema = wengineBaseSchema.transform((data) => {
  const { sanitizedLevel: level, milestone: modification } =
    validateLevelMilestone(data.level, data.modification)

  return {
    ...data,
    level,
    modification,
  }
})

export type IWengine = z.infer<typeof wengineSchema>

export function parseWengine(obj: unknown): IWengine | undefined {
  const result = wengineSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
