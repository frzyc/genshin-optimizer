import {
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
} from '@genshin-optimizer/common/database'
import type { MilestoneKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

export const characterSchema = z.object({
  key: zodEnum(allCharacterKeys),
  level: zodBoundedNumber(1, 60, 1),
  promotion: zodBoundedNumber(0, 5, 0) as z.ZodType<MilestoneKey>,
  mindscape: zodBoundedNumber(0, 6, 0),
  core: zodClampedNumber(0, 100, 0),
  dodge: zodClampedNumber(1, 100, 1),
  basic: zodClampedNumber(1, 100, 1),
  chain: zodClampedNumber(1, 100, 1),
  special: zodClampedNumber(1, 100, 1),
  assist: zodClampedNumber(1, 100, 1),
})

export type ICharacter = z.infer<typeof characterSchema>

export const skillKeys = [
  'dodge',
  'basic',
  'chain',
  'special',
  'assist',
] as const
export type SkillKey = (typeof skillKeys)[number]
export type ICharacterSkill = Pick<ICharacter, SkillKey>

export function parseCharacter(obj: unknown): ICharacter | undefined {
  const result = characterSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
