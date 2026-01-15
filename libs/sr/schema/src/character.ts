import {
  zodBooleanRecord,
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
} from '@genshin-optimizer/common/database'
import { clamp } from '@genshin-optimizer/common/util'
import {
  type AscensionKey,
  abilityLimits,
  allBonusAbilityKeys,
  allCharacterKeys,
  allStatBoostKeys,
  basicAbilityLimits,
  validateLevelAsc,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'

const bonusAbilitiesSchema = zodBooleanRecord(allBonusAbilityKeys)
const statBoostsSchema = zodBooleanRecord(allStatBoostKeys)

const skillLevel = z.number().catch(1)

const characterBaseSchema = z.object({
  key: zodEnum(allCharacterKeys),
  level: zodClampedNumber(1, 80, 1),
  eidolon: zodClampedNumber(0, 6, 0),
  ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
  basic: skillLevel,
  skill: skillLevel,
  ult: skillLevel,
  talent: skillLevel,
  bonusAbilities: bonusAbilitiesSchema,
  statBoosts: statBoostsSchema,
  servantSkill: skillLevel,
  servantTalent: skillLevel,
})

export const characterSchema = characterBaseSchema.transform((data) => {
  const { level, ascension } = validateLevelAsc(data.level, data.ascension)

  // Clamp abilities to ascension-dependent limits
  const skillMax = abilityLimits[ascension]
  const basicMax = basicAbilityLimits[ascension]

  return {
    ...data,
    level,
    ascension,
    basic: clamp(data.basic, 1, basicMax),
    skill: clamp(data.skill, 1, skillMax),
    ult: clamp(data.ult, 1, skillMax),
    talent: clamp(data.talent, 1, skillMax),
    servantSkill: clamp(data.servantSkill, 1, skillMax),
    servantTalent: clamp(data.servantTalent, 1, skillMax),
  }
})

export type ICharacter = z.infer<typeof characterSchema>

export function parseCharacter(obj: unknown): ICharacter | undefined {
  const result = characterSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
