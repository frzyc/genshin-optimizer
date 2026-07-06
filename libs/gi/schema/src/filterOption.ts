import { zodFilteredArray } from '@genshin-optimizer/common/database'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

export const artifactSortKeys = [
  'rarity',
  'level',
  'artsetkey',
  'efficiency',
  'mefficiency',
] as const
export type ArtifactSortKey = (typeof artifactSortKeys)[number]
const lockedValues = ['locked', 'unlocked'] as const
const excludedValues = ['excluded', 'included'] as const
const linesValues = [1, 2, 3, 4] as const

export const filterOptionSchema = z.object({
  artSetKeys: zodFilteredArray(allArtifactSetKeys, []),
  rarity: zodFilteredArray(allArtifactRarityKeys, [...allArtifactRarityKeys]),
  levelLow: z.number().min(0).max(20).catch(0),
  levelHigh: z.number().min(0).max(20).catch(20),
  slotKeys: zodFilteredArray(allArtifactSlotKeys, [...allArtifactSlotKeys]),
  mainStatKeys: zodFilteredArray(allMainStatKeys, []),
  substats: zodFilteredArray(allSubstatKeys, []),
  locations: zodFilteredArray(allLocationCharacterKeys, []),
  showEquipped: z.boolean().catch(true),
  showInventory: z.boolean().catch(true),
  locked: zodFilteredArray(lockedValues, [...lockedValues]),
  rvLow: z.number().catch(0),
  rvHigh: z.number().catch(900),
  useMaxRV: z.boolean().catch(false),
  lines: zodFilteredArray(linesValues, [...linesValues]),
  excluded: zodFilteredArray(excludedValues, [...excludedValues]).optional(),
})
export type FilterOption = z.infer<typeof filterOptionSchema>

export function initialFilterOption(): FilterOption {
  return filterOptionSchema.parse({})
}
