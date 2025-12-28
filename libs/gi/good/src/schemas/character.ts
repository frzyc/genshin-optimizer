import { zodNumericLiteral } from '@genshin-optimizer/common/database'
import { clamp } from '@genshin-optimizer/common/util'
import type { AscensionKey, CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allAscensionKeys,
  allCharacterKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

/**
 * GI Character schema - single source of truth for:
 * - TypeScript types (ICharacter interface)
 * - Structural validation
 * - Import/export parsing
 *
 * Note: Business rules (level/ascension co-validation, talent limits)
 * are handled in the DataManager using validateCharLevelAsc and validateTalent.
 */

// Strict schemas for imports
export const characterKeySchema = z
  .string()
  .refine((val): val is CharacterKey =>
    allCharacterKeys.includes(val as CharacterKey)
  )

// ascensionKeySchema is exported from weapon.ts
const ascensionKeySchema = zodNumericLiteral(allAscensionKeys)

// Talent schema - strict
export const talentSchema = z.object({
  auto: z.number().int().min(1).max(15),
  skill: z.number().int().min(1).max(15),
  burst: z.number().int().min(1).max(15),
})

// Talent schema - recovery
export const talentRecoverySchema = z.object({
  auto: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 1, 15) : 1),
    z.number()
  ),
  skill: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 1, 15) : 1),
    z.number()
  ),
  burst: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 1, 15) : 1),
    z.number()
  ),
})

// STRICT schema - for imports (rejects invalid data)
export const characterSchema = z.object({
  key: characterKeySchema,
  level: z.number().int().min(1).max(90),
  constellation: z.number().int().min(0).max(6),
  ascension: ascensionKeySchema,
  talent: talentSchema,
})

// LENIENT schema - for database recovery (provides defaults)
export const characterRecoverySchema = z.object({
  key: characterKeySchema, // Key must be valid - can't recover
  level: z.preprocess(
    (val) => (typeof val === 'number' && val >= 1 && val <= 90 ? val : 1),
    z.number()
  ),
  constellation: z.preprocess(
    (val) => (typeof val === 'number' ? clamp(Math.round(val), 0, 6) : 0),
    z.number()
  ),
  ascension: z.preprocess(
    (val): AscensionKey =>
      typeof val === 'number' && val >= 0 && val <= 6
        ? (val as AscensionKey)
        : 0,
    z.number() as z.ZodType<AscensionKey>
  ),
  talent: z.preprocess((val) => {
    if (!val || typeof val !== 'object') {
      return { auto: 1, skill: 1, burst: 1 }
    }
    return val
  }, talentRecoverySchema),
})

// TypeScript interfaces
export interface ICharacterTalent {
  auto: number
  skill: number
  burst: number
}

export interface ICharacter {
  key: CharacterKey
  level: number
  constellation: number
  ascension: AscensionKey
  talent: ICharacterTalent
}

// Utility function to check if a key is a talent key
export function isTalentKey(tKey: string): tKey is keyof ICharacterTalent {
  return (['auto', 'skill', 'burst'] as const).includes(
    tKey as keyof ICharacterTalent
  )
}

// Raw parsed data type
export type CharacterRecoveryData = z.infer<typeof characterRecoverySchema>

/**
 * Parse character with schema (lenient - for database recovery)
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
