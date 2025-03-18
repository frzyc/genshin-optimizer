import { clamp, validateArr } from '@genshin-optimizer/common/util'

import type {
  DiscMainStatKey,
  DiscRarityKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
  LocationKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  allLocationKeys,
} from '@genshin-optimizer/zzz/consts'
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

export function initialFilterOption(): FilterOption {
  return {
    discSetKeys: [],
    rarity: [...allDiscRarityKeys],
    levelLow: 0,
    levelHigh: 15,
    slotKeys: [...allDiscSlotKeys],
    mainStatKeys: [],
    substats: [],
    locations: [],
    showEquipped: true,
    showInventory: true,
    locked: ['locked', 'unlocked'],
    rvLow: 0,
    rvHigh: 900, // TODO: Figure out RVs for ZZZ
    useMaxRV: false,
    lines: [1, 2, 3, 4],
  }
}

function initialState(): IDisplayDisc {
  return {
    filterOption: initialFilterOption(),
    ascending: false,
    sortType: discSortKeys[0],
    effFilter: [...allDiscSubStatKeys],
  }
}

export class DisplayDiscEntry extends DataEntry<
  'display_disc',
  'display_disc',
  IDisplayDisc,
  IDisplayDisc
> {
  constructor(database: ZzzDatabase) {
    super(database, 'display_disc', initialState, 'display_disc')
  }
  override validate(obj: unknown): IDisplayDisc | undefined {
    if (typeof obj !== 'object') return undefined
    let { filterOption, ascending, sortType, effFilter } = obj as IDisplayDisc

    if (typeof filterOption !== 'object') filterOption = initialFilterOption()
    else {
      let {
        discSetKeys,
        rarity,
        levelLow,
        levelHigh,
        slotKeys,
        mainStatKeys,
        substats,
        locations,
        showEquipped,
        showInventory,
        locked,
        rvLow,
        rvHigh,
        useMaxRV,
        lines,
      } = filterOption
      discSetKeys = validateArr(discSetKeys, allDiscSetKeys, [])
      rarity = validateArr(rarity, allDiscRarityKeys)

      if (typeof levelLow !== 'number') levelLow = 0
      else levelLow = clamp(levelLow, 0, 15)
      if (typeof levelHigh !== 'number') levelHigh = 0
      else levelHigh = clamp(levelHigh, 0, 15)

      slotKeys = validateArr(slotKeys, allDiscSlotKeys)
      mainStatKeys = validateArr(mainStatKeys, mainStatKeys, [])
      substats = validateArr(substats, allDiscSubStatKeys, [])
      locations = validateArr(locations, allLocationKeys, [])
      if (typeof showEquipped !== 'boolean') showEquipped = true
      if (typeof showInventory !== 'boolean') showInventory = true
      locked = validateArr(locked, ['locked', 'unlocked'])

      if (typeof rvLow !== 'number') rvLow = 0
      if (typeof rvHigh !== 'number') rvHigh = 900 // TODO: Figure out RVs for ZZZ

      if (typeof useMaxRV !== 'boolean') useMaxRV = false

      lines = validateArr(lines, [1, 2, 3, 4])

      filterOption = {
        discSetKeys,
        rarity,
        levelLow,
        levelHigh,
        slotKeys,
        mainStatKeys,
        substats,
        locations,
        showEquipped,
        showInventory,
        locked,
        rvLow,
        rvHigh,
        useMaxRV,
        lines,
      } as FilterOption
    }

    if (typeof ascending !== 'boolean') ascending = false
    if (!discSortKeys.includes(sortType)) sortType = discSortKeys[0]

    effFilter = validateArr(effFilter, allDiscSubStatKeys)

    return {
      filterOption,
      ascending,
      sortType,
      effFilter,
    } as IDisplayDisc
  }
  override set(
    value:
      | Partial<IDisplayDisc>
      | ((v: IDisplayDisc) => Partial<IDisplayDisc> | undefined)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset')
        return super.set({ filterOption: initialFilterOption() })
      return false
    }
    return super.set(value)
  }
}
