import {
  zodBooleanRecord,
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
} from '@genshin-optimizer/common/database'
import type { AscensionKey } from '@genshin-optimizer/sr/consts'
import {
  allBonusAbilityKeys,
  allCharacterKeys,
  allStatBoostKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'

const bonusAbilitiesSchema = zodBooleanRecord(allBonusAbilityKeys)
const statBoostsSchema = zodBooleanRecord(allStatBoostKeys)

const skillLevel = zodClampedNumber(1, 10, 1)

export const characterSchema = z.object({
  key: zodEnum(allCharacterKeys),
  level: zodClampedNumber(1, 80, 1),
  eidolon: zodClampedNumber(0, 6, 0),
  ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
  basic: zodClampedNumber(1, 6, 1),
  skill: skillLevel,
  ult: skillLevel,
  talent: skillLevel,
  bonusAbilities: bonusAbilitiesSchema,
  statBoosts: statBoostsSchema,
  servantSkill: skillLevel,
  servantTalent: skillLevel,
})

export type ICharacter = z.infer<typeof characterSchema>

export function parseCharacter(obj: unknown): ICharacter | undefined {
  const result = characterSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
