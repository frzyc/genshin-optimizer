import {
  zodBoolean,
  zodClampedNumber,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import type {
  DiscMainStatKey,
  DiscRarityKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
  LocationKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscMainStatKeys,
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  allLocationKeys,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'

export const discSortKeys = [
  'rarity',
  'level',
  'discsetkey',
  'efficiency',
  'mefficiency',
] as const
export type DiscSortKey = (typeof discSortKeys)[number]

export type FilterOption = {
  discSetKeys: DiscSetKey[]
  rarity: DiscRarityKey[]
  levelLow: number
  levelHigh: number
  slotKeys: DiscSlotKey[]
  mainStatKeys: DiscMainStatKey[]
  substats: DiscSubStatKey[]
  locations: LocationKey[]
  showEquipped: boolean
  showInventory: boolean
  locked: Array<'locked' | 'unlocked'>
  rvLow: number
  rvHigh: number
  useMaxRV: boolean
  lines: Array<1 | 2 | 3 | 4>
}

export type IDisplayDisc = {
  filterOption: FilterOption
  ascending: boolean
  sortType: DiscSortKey
  effFilter: DiscSubStatKey[]
}

// Schema for nested FilterOption - single source of truth
const filterOptionSchemaInternal = z.object({
  discSetKeys: zodFilteredArray(allDiscSetKeys, []),
  rarity: zodFilteredArray(allDiscRarityKeys),
  levelLow: zodClampedNumber(0, 15, 0),
  levelHigh: zodClampedNumber(0, 15, 15),
  slotKeys: zodFilteredArray(allDiscSlotKeys),
  mainStatKeys: zodFilteredArray(allDiscMainStatKeys, []),
  substats: zodFilteredArray(allDiscSubStatKeys, []),
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

// Main display disc schema - single source of truth
const displayDiscSchema = z.object({
  filterOption: z.preprocess(
    (val) => (typeof val === 'object' && val !== null ? val : {}),
    filterOptionSchemaInternal
  ),
  ascending: zodBoolean(),
  sortType: zodEnumWithDefault(discSortKeys, 'rarity'),
  effFilter: zodFilteredArray(allDiscSubStatKeys),
}) as z.ZodType<IDisplayDisc>

export class DisplayDiscEntry extends DataEntry<
  'display_disc',
  'display_disc',
  IDisplayDisc,
  IDisplayDisc
> {
  constructor(database: ZzzDatabase) {
    super(
      database,
      'display_disc',
      () => displayDiscSchema.parse({}),
      'display_disc'
    )
  }
  override validate(obj: unknown): IDisplayDisc | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = displayDiscSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
  override set(
    value:
      | Partial<IDisplayDisc>
      | ((v: IDisplayDisc) => Partial<IDisplayDisc> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset')
        return super.set({ filterOption: filterOptionSchema.parse({}) })
      return false
    } else return super.set(value)
  }
}
