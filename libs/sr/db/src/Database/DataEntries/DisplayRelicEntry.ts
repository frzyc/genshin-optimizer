import { clamp, validateArr } from '@genshin-optimizer/common/util'
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
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSlotKeys,
  allRelicSubStatKeys,
} from '@genshin-optimizer/sr/consts'

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

export function initialFilterOption(): FilterOption {
  return {
    relicSetKeys: [],
    rarity: [...allRelicRarityKeys],
    levelLow: 0,
    levelHigh: 15,
    slotKeys: [...allRelicSlotKeys],
    mainStatKeys: [],
    substats: [],
    locations: [],
    showEquipped: true,
    showInventory: true,
    locked: ['locked', 'unlocked'],
    rvLow: 0,
    rvHigh: 900, // TODO: Figure out RVs for SRO
    useMaxRV: false,
    lines: [1, 2, 3, 4],
  }
}

function initialState(): IDisplayRelic {
  return {
    filterOption: initialFilterOption(),
    ascending: false,
    sortType: relicSortKeys[0],
    effFilter: [...allRelicSubStatKeys],
  }
}

export class DisplayRelicEntry extends DataEntry<
  'display_relic',
  'display_relic',
  IDisplayRelic,
  IDisplayRelic
> {
  constructor(database: SroDatabase) {
    super(database, 'display_relic', initialState, 'display_relic')
  }
  override validate(obj: unknown): IDisplayRelic | undefined {
    if (typeof obj !== 'object') return undefined
    let { filterOption, ascending, sortType, effFilter } = obj as IDisplayRelic

    if (typeof filterOption !== 'object') filterOption = initialFilterOption()
    else {
      let {
        relicSetKeys,
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
      relicSetKeys = validateArr(relicSetKeys, allRelicSetKeys, [])
      rarity = validateArr(rarity, allRelicRarityKeys)

      if (typeof levelLow !== 'number') levelLow = 0
      else levelLow = clamp(levelLow, 0, 15)
      if (typeof levelHigh !== 'number') levelHigh = 0
      else levelHigh = clamp(levelHigh, 0, 15)

      slotKeys = validateArr(slotKeys, allRelicSlotKeys)
      mainStatKeys = validateArr(mainStatKeys, mainStatKeys, [])
      substats = validateArr(substats, allRelicSubStatKeys, [])
      locations = validateArr(locations, allLocationKeys, [])
      if (typeof showEquipped !== 'boolean') showEquipped = true
      if (typeof showInventory !== 'boolean') showInventory = true
      locked = validateArr(locked, ['locked', 'unlocked'])

      if (typeof rvLow !== 'number') rvLow = 0
      if (typeof rvHigh !== 'number') rvHigh = 900 // TODO: Figure out RVs for SRO

      if (typeof useMaxRV !== 'boolean') useMaxRV = false

      lines = validateArr(lines, [1, 2, 3, 4])

      filterOption = {
        relicSetKeys,
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
    if (!relicSortKeys.includes(sortType)) sortType = relicSortKeys[0]

    effFilter = validateArr(effFilter, allRelicSubStatKeys)

    return {
      filterOption,
      ascending,
      sortType,
      effFilter,
    } as IDisplayRelic
  }
  override set(
    value:
      | Partial<IDisplayRelic>
      | ((v: IDisplayRelic) => Partial<IDisplayRelic> | undefined)
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
