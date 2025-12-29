import {
  zodEnumWithDefault,
  zodFilteredArray,
  zodObjectSchema,
} from '@genshin-optimizer/common/database'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export const artifactSortKeys = [
  'rarity',
  'level',
  'artsetkey',
  'efficiency',
  'mefficiency',
] as const
export type ArtifactSortKey = (typeof artifactSortKeys)[number]

const filterOptionSchema = z.object({
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
  locked: zodFilteredArray(['locked', 'unlocked'] as const, [
    'locked',
    'unlocked',
  ]),
  rvLow: z.number().catch(0),
  rvHigh: z.number().catch(900),
  useMaxRV: z.boolean().catch(false),
  lines: zodFilteredArray([1, 2, 3, 4] as const, [1, 2, 3, 4]),
  excluded: zodFilteredArray(['excluded', 'included'] as const, [
    'excluded',
    'included',
  ]).optional(),
})
export type ArtifactFilterOption = z.infer<typeof filterOptionSchema>

const displayArtifactSchema = z.object({
  filterOption: zodObjectSchema(filterOptionSchema),
  ascending: z.boolean().catch(false),
  sortType: zodEnumWithDefault(artifactSortKeys, 'rarity'),
  effFilter: zodFilteredArray(allSubstatKeys, [...allSubstatKeys]),
})
export type IDisplayArtifact = z.infer<typeof displayArtifactSchema>

// Helper for reset action
export function initialArtifactFilterOption(): ArtifactFilterOption {
  return filterOptionSchema.parse({})
}

export class DisplayArtifactEntry extends DataEntry<
  'display_artifact',
  'display_artifact',
  IDisplayArtifact,
  IDisplayArtifact
> {
  constructor(database: ArtCharDatabase) {
    super(
      database,
      'display_artifact',
      () => displayArtifactSchema.parse({}),
      'display_artifact'
    )
  }
  override validate(obj: unknown): IDisplayArtifact | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = displayArtifactSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
  override set(
    value:
      | Partial<IDisplayArtifact>
      | ((v: IDisplayArtifact) => Partial<IDisplayArtifact> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset')
        return super.set({ filterOption: initialArtifactFilterOption() })
      return false
    } else return super.set(value)
  }
}
