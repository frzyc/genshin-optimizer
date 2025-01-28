import type { FilterConfigs } from '@genshin-optimizer/common/util'
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
  allDiscSlotKeys,
} from '@genshin-optimizer/zzz/consts'
import type { IDisc } from '@genshin-optimizer/zzz/db'

export type DiscFilterOption = {
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
  excluded?: Array<'excluded' | 'included'>
}

export function initialDiscFilterOption(): DiscFilterOption {
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
    rvHigh: 900,
    useMaxRV: false,
    lines: [1, 2, 3, 4],
    excluded: ['excluded', 'included'],
  }
}

export function discFilterConfigs({
  excludedIds = [],
}: {
  excludedIds?: string[]
} = {}): FilterConfigs<keyof DiscFilterOption, IDisc & { id: string }> {
  return {
    locked: (art, filter) => {
      if (!filter.includes('locked') && art.lock) return false
      if (!filter.includes('unlocked') && !art.lock) return false
      return true
    },
    locations: (art, filter, filters) =>
      art.location && !filters['showEquipped']
        ? filter.includes(art.location)
        : true,
    showEquipped: () => true, // Per character filtering is applied in `locations`
    showInventory: (art, filter) => (!art.location ? filter : true),
    discSetKeys: (art, filter) =>
      filter.length ? filter.includes(art.setKey) : true,
    slotKeys: (art, filter) => filter.includes(art.slotKey),
    mainStatKeys: (art, filter) =>
      filter.length ? filter.includes(art.mainStatKey) : true,
    levelLow: (art, filter) => filter <= art.level,
    levelHigh: (art, filter) => filter >= art.level,
    // When RV is set to 0/900, allow all, just incase someone is doing some teehee haha with negative substats or stupid rolls
    rvLow: (disc, filter) => {
      return true
    },
    rvHigh: (art, filter) => {
      return true
    },
    useMaxRV: () => true,
    rarity: (art, filter) => filter.includes(art.rarity),
    substats: (art, filter) => {
      for (const filterKey of filter)
        if (
          filterKey &&
          !art.substats.some((substat) => substat.key === filterKey)
        )
          return false
      return true
    },
    lines: (art, filter) =>
      [0, ...filter].includes(art.substats.filter((s) => s.upgrades).length),
    excluded: (art, filter) => {
      if (!filter.includes('excluded') && excludedIds.includes(art.id))
        return false
      if (!filter.includes('included') && !excludedIds.includes(art.id))
        return false
      return true
    },
  }
}
