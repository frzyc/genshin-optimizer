import {
  zodBoolean,
  zodClampedNumber,
  zodEnumWithDefault,
  zodFilteredArray,
  zodObjectSchema,
} from '@genshin-optimizer/common/database'
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

const filterOptionSchema = z.object({
  discSetKeys: zodFilteredArray(allDiscSetKeys, []),
  rarity: zodFilteredArray(allDiscRarityKeys),
  levelLow: zodClampedNumber(0, 15, 0),
  levelHigh: zodClampedNumber(0, 15, 15),
  slotKeys: zodFilteredArray(allDiscSlotKeys),
  mainStatKeys: zodFilteredArray(allDiscMainStatKeys, []),
  substats: zodFilteredArray(allDiscSubStatKeys, []),
  locations: zodFilteredArray(allLocationKeys, []),
  showEquipped: zodBoolean(true),
  showInventory: zodBoolean(true),
  locked: zodFilteredArray(['locked', 'unlocked'] as const),
  rvLow: zodClampedNumber(0, 900, 0),
  rvHigh: zodClampedNumber(0, 900, 900),
  useMaxRV: zodBoolean(),
  lines: zodFilteredArray([1, 2, 3, 4] as const),
})
export type FilterOption = z.infer<typeof filterOptionSchema>

export function initialFilterOption(): FilterOption {
  return filterOptionSchema.parse({})
}

const displayDiscSchema = z.object({
  filterOption: zodObjectSchema(filterOptionSchema),
  ascending: zodBoolean(),
  sortType: zodEnumWithDefault(discSortKeys, 'rarity'),
  effFilter: zodFilteredArray(allDiscSubStatKeys),
})
export type IDisplayDisc = z.infer<typeof displayDiscSchema>

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
