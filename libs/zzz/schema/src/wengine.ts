import {
  zodBoolean,
  zodBoundedNumber,
  zodEnum,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import type { MilestoneKey, PhaseKey } from '@genshin-optimizer/zzz/consts'
import {
  allLocationKeys,
  allWengineKeys,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

export const wengineSchema = z.object({
  key: zodEnum(allWengineKeys),
  level: zodBoundedNumber(1, wengineMaxLevel, 1),
  phase: zodBoundedNumber(1, 5, 1) as z.ZodType<PhaseKey>,
  modification: zodBoundedNumber(0, 5, 0) as z.ZodType<MilestoneKey>,
  location: zodEnumWithDefault(allLocationKeys, ''),
  lock: zodBoolean({ coerce: true }),
})

export type IWengine = z.infer<typeof wengineSchema>

export function parseWengine(obj: unknown): IWengine | undefined {
  const result = wengineSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
