import {
  zodArray,
  zodBoolean,
  zodClampedNumber,
  zodEnumWithDefault,
  zodNumericLiteralWithDefault,
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
  value: z.number().finite().catch(0),
  initialValue: z.number().finite().optional(),
})

export const artifactSchema = z.object({
  setKey: zodEnumWithDefault(allArtifactSetKeys, allArtifactSetKeys[0]),
  slotKey: zodEnumWithDefault(allArtifactSlotKeys, 'flower'),
  level: zodClampedNumber(0, 20, 0),
  rarity: zodNumericLiteralWithDefault(
    allArtifactRarityKeys,
    5
  ) as z.ZodType<ArtifactRarity>,
  mainStatKey: zodEnumWithDefault(allMainStatKeys, 'hp'),
  location: zodEnumWithDefault([...allLocationCharacterKeys, ''] as const, ''),
  lock: zodBoolean({ coerce: true }),
  substats: zodArray(substatSchema),
  totalRolls: z.number().int().min(0).max(9).optional(),
  astralMark: z.boolean().optional(),
  elixirCrafted: z.boolean().optional(),
  unactivatedSubstats: z.array(substatSchema).optional(),
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
