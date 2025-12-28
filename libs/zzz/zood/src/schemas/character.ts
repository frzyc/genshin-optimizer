import { zodNumericLiteral } from '@genshin-optimizer/common/database'
import { clamp } from '@genshin-optimizer/common/util'
import type { CharacterKey, MilestoneKey } from '@genshin-optimizer/zzz/consts'
import {
  allCharacterKeys,
  allMilestoneKeys,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

/**
 * Character schema - single source of truth for:
 * - TypeScript type (via ICharacter interface)
 * - Structural validation
 * - Import/export parsing
 *
 * Note: Character validation has complex post-processing because
 * skill limits depend on promotion level. The schema handles basic
 * structural validation, while the DataManager applies business rules
 * (level/promotion co-validation, skill clamping based on promotion).
 */

// Strict schemas for imports
export const characterKeySchema = z
  .string()
  .refine((val): val is CharacterKey =>
    allCharacterKeys.includes(val as CharacterKey)
  )

export const promotionSchema = zodNumericLiteral(allMilestoneKeys)

// STRICT schema - for imports (rejects invalid data)
export const characterSchema = z.object({
  key: characterKeySchema,
  level: z.number().int().min(1).max(60),
  promotion: promotionSchema,
  mindscape: z.number().int().min(0).max(6),
  core: z.number().int().min(0).max(6),
  dodge: z.number().int().min(1).max(12),
  basic: z.number().int().min(1).max(12),
  chain: z.number().int().min(1).max(12),
  special: z.number().int().min(1).max(12),
  assist: z.number().int().min(1).max(12),
})

// LENIENT schema - for database recovery (provides defaults)
export const characterRecoverySchema = z.object({
  key: characterKeySchema, // Key must be valid - can't recover
  level: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 && val <= 60 ? val : 1),
    z.number()
  ),
  promotion: z.preprocess(
    (val): MilestoneKey =>
      typeof val === 'number' && val >= 0 && val <= 5
        ? (val as MilestoneKey)
        : 0,
    z.number() as z.ZodType<MilestoneKey>
  ),
  mindscape: z.preprocess(
    (val) => (typeof val === 'number' && val >= 0 && val <= 6 ? val : 0),
    z.number()
  ),
  core: z.preprocess(
    (val) => (typeof val === 'number' && val >= 0 ? clamp(val, 0, 100) : 0),
    z.number()
  ),
  dodge: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 ? clamp(val, 1, 100) : 1),
    z.number()
  ),
  basic: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 ? clamp(val, 1, 100) : 1),
    z.number()
  ),
  chain: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 ? clamp(val, 1, 100) : 1),
    z.number()
  ),
  special: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 ? clamp(val, 1, 100) : 1),
    z.number()
  ),
  assist: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 ? clamp(val, 1, 100) : 1),
    z.number()
  ),
})

// Skill keys for iteration
export const skillKeys = [
  'dodge',
  'basic',
  'chain',
  'special',
  'assist',
] as const
export type SkillKey = (typeof skillKeys)[number]

// TypeScript interface
export interface ICharacterSkill {
  dodge: number
  basic: number
  chain: number
  special: number
  assist: number
}

export interface ICharacter extends ICharacterSkill {
  key: CharacterKey
  level: number
  core: number
  mindscape: number
  promotion: MilestoneKey
}

// Raw parsed data type (before business rules applied)
export type CharacterRecoveryData = z.infer<typeof characterRecoverySchema>

/**
 * Parse character with schema (lenient - for database recovery)
 *
 * Note: This returns the raw parsed data. For full validation including
 * level/promotion co-validation and skill clamping, use the DataManager
 * which has access to game utils.
 */
export function parseCharacterRecovery(
  obj: unknown
): CharacterRecoveryData | undefined {
  if (!obj || typeof obj !== 'object') return undefined

  const result = characterRecoverySchema.safeParse(obj)
  return result.success ? result.data : undefined
}

/**
 * Parse character import data (strict - throws on invalid)
 */
export function parseCharacterImport(obj: unknown) {
  return characterSchema.parse(obj)
}

/**
 * Safe parse character import data (strict - returns result object)
 */
export function safeParseCharacterImport(obj: unknown) {
  return characterSchema.safeParse(obj)
}
