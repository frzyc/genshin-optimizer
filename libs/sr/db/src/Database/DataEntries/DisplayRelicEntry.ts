import {
  zodBoolean,
  zodClampedNumber,
  zodEnumWithDefault,
  zodFilteredArray,
  zodObjectSchema,
} from '@genshin-optimizer/common/database'
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

const filterOptionSchema = z.object({
  relicSetKeys: zodFilteredArray(allRelicSetKeys, []),
  rarity: zodFilteredArray(allRelicRarityKeys),
  levelLow: zodClampedNumber(0, 15, 0),
  levelHigh: zodClampedNumber(0, 15, 15),
  slotKeys: zodFilteredArray(allRelicSlotKeys),
  mainStatKeys: zodFilteredArray(allRelicMainStatKeys, []),
  substats: zodFilteredArray(allRelicSubStatKeys, []),
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

const displayRelicSchema = z.object({
  filterOption: zodObjectSchema(filterOptionSchema),
  ascending: zodBoolean(),
  sortType: zodEnumWithDefault(relicSortKeys, 'rarity'),
  effFilter: zodFilteredArray(allRelicSubStatKeys),
})
export type IDisplayRelic = z.infer<typeof displayRelicSchema>

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
