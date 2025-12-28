import {
  zodBoolean,
  zodClampedNumber,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import type {
  LocationKey,
  RelicMainStatKey,
  RelicRarityKey,
  RelicSetKey,
  RelicSlotKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import {
  allLocationKeys,
  allRelicMainStatKeys,
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSlotKeys,
  allRelicSubStatKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import { DataEntry } from '../DataEntry'
import type { SroDatabase } from '../Database'

export const relicSortKeys = [
  'rarity',
  'level',
  'relicsetkey',
  'efficiency',
  'mefficiency',
] as const
export type RelicSortKey = (typeof relicSortKeys)[number]

// Explicit types for better type inference
export type FilterOption = {
  relicSetKeys: RelicSetKey[]
  rarity: RelicRarityKey[]
  levelLow: number
  levelHigh: number
  slotKeys: RelicSlotKey[]
  mainStatKeys: RelicMainStatKey[]
  substats: RelicSubStatKey[]
  locations: LocationKey[]
  showEquipped: boolean
  showInventory: boolean
  locked: Array<'locked' | 'unlocked'>
  rvLow: number
  rvHigh: number
  useMaxRV: boolean
  lines: Array<1 | 2 | 3 | 4>
}

export type IDisplayRelic = {
  filterOption: FilterOption
  ascending: boolean
  sortType: RelicSortKey
  effFilter: RelicSubStatKey[]
}

// Schema for nested FilterOption - single source of truth
const filterOptionSchemaInternal = z.object({
  relicSetKeys: zodFilteredArray(allRelicSetKeys, []),
  rarity: zodFilteredArray(allRelicRarityKeys),
  levelLow: zodClampedNumber(0, 15, 0),
  levelHigh: zodClampedNumber(0, 15, 15),
  slotKeys: zodFilteredArray(allRelicSlotKeys),
  mainStatKeys: zodFilteredArray(allRelicMainStatKeys, []),
  substats: zodFilteredArray(allRelicSubStatKeys, []),
  locations: zodFilteredArray(allLocationKeys, []),
  showEquipped: zodBoolean({ defaultValue: true }),
  showInventory: zodBoolean({ defaultValue: true }),
  locked: zodFilteredArray(['locked', 'unlocked'] as const),
  rvLow: zodClampedNumber(0, 900, 0),
  rvHigh: zodClampedNumber(0, 900, 900),
  useMaxRV: zodBoolean(),
  lines: zodFilteredArray([1, 2, 3, 4] as const),
})

// Typed version for external use
const filterOptionSchema = filterOptionSchemaInternal as z.ZodType<FilterOption>

// Helper function for getting initial filter option (uses schema as source of truth)
export function initialFilterOption(): FilterOption {
  return filterOptionSchema.parse({})
}

// Main display relic schema - single source of truth
const displayRelicSchema = z.object({
  filterOption: z.preprocess(
    (val) => (typeof val === 'object' && val !== null ? val : {}),
    filterOptionSchemaInternal
  ),
  ascending: zodBoolean(),
  sortType: zodEnumWithDefault(relicSortKeys, 'rarity'),
  effFilter: zodFilteredArray(allRelicSubStatKeys),
}) as z.ZodType<IDisplayRelic>

export class DisplayRelicEntry extends DataEntry<
  'display_relic',
  'display_relic',
  IDisplayRelic,
  IDisplayRelic
> {
  constructor(database: SroDatabase) {
    super(
      database,
      'display_relic',
      () => displayRelicSchema.parse({}),
      'display_relic'
    )
  }
  override validate(obj: unknown): IDisplayRelic | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = displayRelicSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
  override set(
    value:
      | Partial<IDisplayRelic>
      | ((v: IDisplayRelic) => Partial<IDisplayRelic> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset')
        return super.set({ filterOption: filterOptionSchema.parse({}) })
      return false
    } else return super.set(value)
  }
}
