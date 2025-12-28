import { zodFilteredArray } from '@genshin-optimizer/common/database'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import {
  type ArtifactFilterOption,
  type ArtifactSortKey,
  artifactSortKeys,
} from '@genshin-optimizer/gi/util'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

// Use the existing FilterOption type from gi/util for compatibility
export type FilterOption = ArtifactFilterOption

// Filter option schema with defaults
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
}) as z.ZodType<FilterOption>

// Display artifact interface using existing types
export interface IDisplayArtifact {
  filterOption: FilterOption
  ascending: boolean
  sortType: ArtifactSortKey
  effFilter: SubstatKey[]
}

// Main display artifact schema with defaults
const displayArtifactSchema = z.object({
  filterOption: filterOptionSchema.catch(filterOptionSchema.parse({})),
  ascending: z.boolean().catch(false),
  sortType: z
    .enum(
      artifactSortKeys as unknown as [ArtifactSortKey, ...ArtifactSortKey[]]
    )
    .catch(artifactSortKeys[0]),
  effFilter: z
    .array(z.enum(allSubstatKeys as unknown as [SubstatKey, ...SubstatKey[]]))
    .catch([...allSubstatKeys]),
}) as z.ZodType<IDisplayArtifact>

// Helper for reset action
export function initialFilterOption(): FilterOption {
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
        return super.set({ filterOption: initialFilterOption() })
      return false
    } else return super.set(value)
  }
}
