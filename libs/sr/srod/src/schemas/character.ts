import { zodClampedNumber, zodEnum } from '@genshin-optimizer/common/database'
import type { AscensionKey, BonusAbilityKey, StatBoostKey } from '@genshin-optimizer/sr/consts'
import {
  allAscensionKeys,
  allBonusAbilityKeys,
  allCharacterKeys,
  allStatBoostKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import type { ICharacter } from '../ICharacter'

// Character key - non-recoverable
const characterKey = zodEnum(allCharacterKeys)

// Ascension key validation
const ascensionKey = z.preprocess((val) => {
  if (typeof val !== 'number') return 0
  if (!allAscensionKeys.includes(val as AscensionKey)) return 0
  return val
}, z.number()) as z.ZodType<AscensionKey>

// Eidolon validation - clamp to [0, 6]
const eidolonKey = zodClampedNumber(0, 6, 0)

// Skill levels validation
const basicLevel = zodClampedNumber(1, 6, 1)
const skillLevel = zodClampedNumber(1, 10, 1)

// Bonus abilities partial record
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

// Stat boosts partial record
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

/**
 * Schema for validating character data during import/recovery.
 */
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

/**
 * Validates character data and applies level/ascension co-validation.
 * @param obj - Raw character data to validate
 * @param validateLevelAsc - Function to co-validate level and ascension
 * @returns Validated ICharacter or undefined if invalid
 */
export function validateCharacterWithRules(
  obj: unknown,
  validateLevelAsc: (
    level: number,
    ascension: AscensionKey
  ) => { level: number; ascension: AscensionKey }
): ICharacter | undefined {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const { key, level: rawLevel, ascension: rawAscension } = obj as ICharacter

  // Key is non-recoverable
  if (!allCharacterKeys.includes(key)) return undefined

  // Apply level/ascension co-validation
  const { level, ascension } = validateLevelAsc(
    typeof rawLevel === 'number' ? rawLevel : 1,
    typeof rawAscension === 'number' && allAscensionKeys.includes(rawAscension as AscensionKey)
      ? (rawAscension as AscensionKey)
      : 0
  )

  // Now parse with defaults for other fields
  const result = characterSchema.safeParse({ ...obj, level, ascension })
  return result.success ? result.data : undefined
}
