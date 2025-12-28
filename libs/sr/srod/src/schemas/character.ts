import { zodClampedNumber, zodEnum } from '@genshin-optimizer/common/database'
import type {
  AscensionKey,
  BonusAbilityKey,
  StatBoostKey,
} from '@genshin-optimizer/sr/consts'
import {
  allAscensionKeys,
  allBonusAbilityKeys,
  allCharacterKeys,
  allStatBoostKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import type { ICharacter } from '../ICharacter'

const characterKey = zodEnum(allCharacterKeys)

const ascensionKey = z.preprocess((val) => {
  if (typeof val !== 'number') return 0
  if (!allAscensionKeys.includes(val as AscensionKey)) return 0
  return val
}, z.number()) as z.ZodType<AscensionKey>

const eidolonKey = zodClampedNumber(0, 6, 0)

const basicLevel = zodClampedNumber(1, 6, 1)
const skillLevel = zodClampedNumber(1, 10, 1)

const bonusAbilitiesSchema = z.preprocess((val) => {
  const defaultVal = {} as Partial<Record<BonusAbilityKey, boolean>>
  for (const key of allBonusAbilityKeys) {
    defaultVal[key] = false
  }
  if (typeof val !== 'object' || val === null) return defaultVal
  const obj = val as Record<string | number, unknown>
  for (const key of allBonusAbilityKeys) {
    defaultVal[key] = typeof obj[key] === 'boolean' ? Boolean(obj[key]) : false
  }
  return defaultVal
}, z.any()) as z.ZodType<Partial<Record<BonusAbilityKey, boolean>>>

const statBoostsSchema = z.preprocess((val) => {
  const defaultVal = {} as Partial<Record<StatBoostKey, boolean>>
  for (const key of allStatBoostKeys) {
    defaultVal[key] = false
  }
  if (typeof val !== 'object' || val === null) return defaultVal
  const obj = val as Record<string | number, unknown>
  for (const key of allStatBoostKeys) {
    defaultVal[key] = typeof obj[key] === 'boolean' ? Boolean(obj[key]) : false
  }
  return defaultVal
}, z.any()) as z.ZodType<Partial<Record<StatBoostKey, boolean>>>

export const characterSchema = z.object({
  key: characterKey,
  level: zodClampedNumber(1, 80, 1),
  eidolon: eidolonKey,
  ascension: ascensionKey,
  basic: basicLevel,
  skill: skillLevel,
  ult: skillLevel,
  talent: skillLevel,
  bonusAbilities: bonusAbilitiesSchema,
  statBoosts: statBoostsSchema,
  servantSkill: skillLevel,
  servantTalent: skillLevel,
}) as z.ZodType<ICharacter>

export function validateCharacterWithRules(
  obj: unknown,
  validateLevelAsc: (
    level: number,
    ascension: AscensionKey
  ) => { level: number; ascension: AscensionKey }
): ICharacter | undefined {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const { key, level: rawLevel, ascension: rawAscension } = obj as ICharacter

  if (!allCharacterKeys.includes(key)) return undefined

  const { level, ascension } = validateLevelAsc(
    typeof rawLevel === 'number' ? rawLevel : 1,
    typeof rawAscension === 'number' &&
      allAscensionKeys.includes(rawAscension as AscensionKey)
      ? (rawAscension as AscensionKey)
      : 0
  )

  const result = characterSchema.safeParse({ ...obj, level, ascension })
  return result.success ? result.data : undefined
}
