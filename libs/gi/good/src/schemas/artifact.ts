import { clamp } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationCharacterKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
  artMaxLevel,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

/**
 * GI Artifact schema - single source of truth for:
 * - TypeScript types (IArtifact, ISubstat interfaces)
 * - Structural validation
 * - Import/export parsing
 *
 * Note: Artifacts have complex interdependencies:
 * - mainStatKey validity depends on slotKey
 * - level max depends on rarity
 * - substats cannot match mainStatKey
 * - substat value validation needs roll calculation
 *
 * The schema handles structural validation, while the DataManager
 * applies business rules using allStats and getSubstatRange.
 */

// Strict schemas
export const artifactSetKeySchema = z
  .string()
  .refine((val): val is ArtifactSetKey =>
    allArtifactSetKeys.includes(val as ArtifactSetKey)
  )

export const artifactSlotKeySchema = z
  .string()
  .refine((val): val is ArtifactSlotKey =>
    allArtifactSlotKeys.includes(val as ArtifactSlotKey)
  )

export const mainStatKeySchema = z
  .string()
  .refine((val): val is MainStatKey =>
    allMainStatKeys.includes(val as MainStatKey)
  )

export const substatKeySchema = z
  .string()
  .refine(
    (val): val is SubstatKey | '' =>
      val === '' || allSubstatKeys.includes(val as SubstatKey),
    { message: 'Invalid substat key' }
  )

export const artifactRaritySchema = z
  .number()
  .refine((val): val is ArtifactRarity =>
    allArtifactRarityKeys.includes(val as ArtifactRarity)
  )

// Substat schemas
export const substatSchema = z.object({
  key: substatKeySchema,
  value: z.number(),
  initialValue: z.number().optional(),
})

export const substatRecoverySchema = z.object({
  key: z.preprocess(
    (val): SubstatKey | '' =>
      allSubstatKeys.includes(val as SubstatKey) ? (val as SubstatKey) : '',
    z.string() as z.ZodType<SubstatKey | ''>
  ),
  value: z.preprocess(
    (val) => (typeof val === 'number' && isFinite(val) ? val : 0),
    z.number()
  ),
  initialValue: z.preprocess(
    (val) => (typeof val === 'number' && isFinite(val) ? val : undefined),
    z.number().optional()
  ),
})

// STRICT schema - for imports (rejects invalid data)
export const artifactSchema = z.object({
  setKey: artifactSetKeySchema,
  slotKey: artifactSlotKeySchema,
  level: z.number().int().min(0).max(20),
  rarity: artifactRaritySchema,
  mainStatKey: mainStatKeySchema,
  location: z.string(),
  lock: z.boolean(),
  substats: z.array(substatSchema),
  // GOOD 3 fields
  totalRolls: z.number().int().min(0).max(9).optional(),
  astralMark: z.boolean().optional(),
  elixirCrafted: z.boolean().optional(),
  unactivatedSubstats: z.array(substatSchema).optional(),
})

// LENIENT schema - for database recovery (provides defaults)
export const artifactRecoverySchema = z.object({
  setKey: z.preprocess(
    (val): ArtifactSetKey =>
      allArtifactSetKeys.includes(val as ArtifactSetKey)
        ? (val as ArtifactSetKey)
        : allArtifactSetKeys[0],
    z.string() as z.ZodType<ArtifactSetKey>
  ),
  slotKey: z.preprocess(
    (val): ArtifactSlotKey =>
      allArtifactSlotKeys.includes(val as ArtifactSlotKey)
        ? (val as ArtifactSlotKey)
        : 'flower',
    z.string() as z.ZodType<ArtifactSlotKey>
  ),
  // Note: level is preserved as-is (rounded) for business rule validation
  // (reject if > max for rarity). Clamping happens in DataManager.
  level: z.preprocess(
    (val) => (typeof val === 'number' ? Math.round(val) : 0),
    z.number()
  ),
  rarity: z.preprocess(
    (val): ArtifactRarity =>
      allArtifactRarityKeys.includes(val as ArtifactRarity)
        ? (val as ArtifactRarity)
        : 5,
    z.number() as z.ZodType<ArtifactRarity>
  ),
  mainStatKey: z.preprocess(
    (val): MainStatKey =>
      allMainStatKeys.includes(val as MainStatKey)
        ? (val as MainStatKey)
        : 'hp',
    z.string() as z.ZodType<MainStatKey>
  ),
  location: z.preprocess(
    (val): LocationCharacterKey | '' =>
      val && allLocationCharacterKeys.includes(val as LocationCharacterKey)
        ? (val as LocationCharacterKey)
        : '',
    z.string() as z.ZodType<LocationCharacterKey | ''>
  ),
  lock: z.preprocess((val) => !!val, z.boolean()),
  substats: z.preprocess(
    (val) => (Array.isArray(val) ? val : []),
    z.array(substatRecoverySchema)
  ),
  // GOOD 3 fields
  totalRolls: z.preprocess(
    (val) =>
      typeof val === 'number' ? clamp(Math.round(val), 0, 9) : undefined,
    z.number().optional()
  ),
  astralMark: z.preprocess(
    (val) => (typeof val === 'boolean' ? val : undefined),
    z.boolean().optional()
  ),
  elixirCrafted: z.preprocess(
    (val) => (typeof val === 'boolean' ? val : undefined),
    z.boolean().optional()
  ),
  unactivatedSubstats: z.preprocess(
    (val) => (Array.isArray(val) ? val : undefined),
    z.array(substatRecoverySchema).optional()
  ),
})

// TypeScript interfaces

// Base substat (GOOD 2 and below)
export interface IBaseSubstat {
  key: SubstatKey | ''
  value: number
}

// Extended substat (GOOD 3)
export interface ISubstat extends IBaseSubstat {
  initialValue?: number
}

// Base artifact (GOOD 2 and below)
export interface IBaseArtifact {
  setKey: ArtifactSetKey
  slotKey: ArtifactSlotKey
  level: number
  rarity: ArtifactRarity
  mainStatKey: MainStatKey
  location: LocationCharacterKey | ''
  lock: boolean
  substats: ISubstat[]
}

// Extended artifact (GOOD 3)
export interface IArtifact extends IBaseArtifact {
  totalRolls?: number // 3-9 for valid 5* artifacts
  astralMark?: boolean // Favorite star in-game
  elixirCrafted?: boolean // Created using Sanctifying Elixir
  unactivatedSubstats?: ISubstat[]
}

// Raw parsed data type
export type ArtifactRecoveryData = z.infer<typeof artifactRecoverySchema>

/**
 * Parse artifact with schema (lenient - for database recovery)
 * Returns raw parsed data. Business rules (slot/mainstat validation,
 * substat value clamping) should be applied by the DataManager.
 */
export function parseArtifactRecovery(
  obj: unknown
): ArtifactRecoveryData | undefined {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const result = artifactRecoverySchema.safeParse(obj)
  return result.success ? result.data : undefined
}

/**
 * Parse artifact import data (strict - throws on invalid)
 */
export function parseArtifactImport(obj: unknown) {
  return artifactSchema.parse(obj)
}

/**
 * Safe parse artifact import data (strict - returns result object)
 */
export function safeParseArtifactImport(obj: unknown) {
  return artifactSchema.safeParse(obj)
}

/**
 * Validate level based on rarity
 */
export function validateArtifactLevel(
  level: number,
  rarity: ArtifactRarity
): number {
  const maxLevel = artMaxLevel[rarity]
  return clamp(level, 0, maxLevel)
}
