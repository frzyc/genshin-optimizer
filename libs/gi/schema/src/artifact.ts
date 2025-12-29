import {
  zodBoolean,
  zodClampedNumber,
  zodEnumWithDefault,
  zodNumericLiteral,
} from '@genshin-optimizer/common/database'
import { clamp } from '@genshin-optimizer/common/util'
import type { ArtifactRarity } from '@genshin-optimizer/gi/consts'
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

export const substatSchema = z.object({
  key: zodEnumWithDefault([...allSubstatKeys, ''] as const, ''),
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
  setKey: zodEnumWithDefault(allArtifactSetKeys, allArtifactSetKeys[0]),
  slotKey: zodEnumWithDefault(allArtifactSlotKeys, 'flower'),
  level: zodClampedNumber(0, 20, 0),
  rarity: z.preprocess(
    (val) =>
      allArtifactRarityKeys.includes(val as ArtifactRarity)
        ? (val as ArtifactRarity)
        : 5,
    zodNumericLiteral(allArtifactRarityKeys)
  ) as z.ZodType<ArtifactRarity>,
  mainStatKey: zodEnumWithDefault(allMainStatKeys, 'hp'),
  location: zodEnumWithDefault([...allLocationCharacterKeys, ''] as const, ''),
  lock: zodBoolean({ coerce: true }),
  substats: z.preprocess(
    (val) => (Array.isArray(val) ? val : []),
    z.array(substatSchema)
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
    z.array(substatSchema).optional()
  ),
})

export type IArtifact = z.infer<typeof artifactSchema>
export type ISubstat = IArtifact['substats'][number]

export function parseArtifact(obj: unknown): IArtifact | undefined {
  const result = artifactSchema.safeParse(obj)
  return result.success ? result.data : undefined
}

export function validateArtifactLevel(
  level: number,
  rarity: ArtifactRarity
): number {
  const maxLevel = artMaxLevel[rarity]
  return clamp(level, 0, maxLevel)
}
