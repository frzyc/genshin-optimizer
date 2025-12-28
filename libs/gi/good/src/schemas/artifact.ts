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

export const artifactSchema = z.object({
  setKey: artifactSetKeySchema,
  slotKey: artifactSlotKeySchema,
  level: z.number().int().min(0).max(20),
  rarity: artifactRaritySchema,
  mainStatKey: mainStatKeySchema,
  location: z.string(),
  lock: z.boolean(),
  substats: z.array(substatSchema),
  totalRolls: z.number().int().min(0).max(9).optional(),
  astralMark: z.boolean().optional(),
  elixirCrafted: z.boolean().optional(),
  unactivatedSubstats: z.array(substatSchema).optional(),
})

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

export interface IBaseSubstat {
  key: SubstatKey | ''
  value: number
}

export interface ISubstat extends IBaseSubstat {
  initialValue?: number
}

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

export interface IArtifact extends IBaseArtifact {
  totalRolls?: number
  astralMark?: boolean
  elixirCrafted?: boolean
  unactivatedSubstats?: ISubstat[]
}

export type ArtifactRecoveryData = z.infer<typeof artifactRecoverySchema>

export function parseArtifactRecovery(
  obj: unknown
): ArtifactRecoveryData | undefined {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const result = artifactRecoverySchema.safeParse(obj)
  return result.success ? result.data : undefined
}

export function parseArtifactImport(obj: unknown) {
  return artifactSchema.parse(obj)
}

export function safeParseArtifactImport(obj: unknown) {
  return artifactSchema.safeParse(obj)
}

export function validateArtifactLevel(
  level: number,
  rarity: ArtifactRarity
): number {
  const maxLevel = artMaxLevel[rarity]
  return clamp(level, 0, maxLevel)
}
