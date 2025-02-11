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

//TODO: Temporary fix for circular dependency, need a better way to resolve it
interface IDisc {
  setKey: DiscSetKey
  slotKey: DiscSlotKey
  level: number // 0-15
  rarity: DiscRarityKey
  mainStatKey: DiscMainStatKey
  location: LocationKey
  lock: boolean
  trash: boolean
  substats: ISubstat[]
}
//TODO: Temporary fix for circular dependency, need a better way to resolve it
interface ISubstat {
  key: DiscSubStatKey
  upgrades: number // This is the number of upgrades this sub receives.
}

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
    locked: (disc, filter) => {
      if (!filter.includes('locked') && disc.lock) return false
      if (!filter.includes('unlocked') && !disc.lock) return false
      return true
    },
    locations: (disc, filter, filters) =>
      disc.location && !filters['showEquipped']
        ? filter.includes(disc.location)
        : true,
    showEquipped: () => true, // Per character filtering is applied in `locations`
    showInventory: (disc, filter) => (!disc.location ? filter : true),
    discSetKeys: (disc, filter) =>
      filter.length ? filter.includes(disc.setKey) : true,
    slotKeys: (disc, filter) => filter.includes(disc.slotKey),
    mainStatKeys: (disc, filter) =>
      filter.length ? filter.includes(disc.mainStatKey) : true,
    levelLow: (disc, filter) => filter <= disc.level,
    levelHigh: (disc, filter) => filter >= disc.level,
    // When RV is set to 0/900, allow all, just incase someone is doing some teehee haha with negative substats or stupid rolls
    rvLow: () => {
      return true
    },
    rvHigh: () => {
      return true
    },
    useMaxRV: () => true,
    rarity: (disc, filter) => filter.includes(disc.rarity),
    substats: (disc, filter) => {
      for (const filterKey of filter)
        if (
          filterKey &&
          !disc.substats.some((substat) => substat.key === filterKey)
        )
          return false
      return true
    },
    lines: (disc, filter) =>
      [0, ...filter].includes(disc.substats.filter((s) => s.upgrades).length),
    excluded: (disc, filter) => {
      if (!filter.includes('excluded') && excludedIds.includes(disc.id))
        return false
      if (!filter.includes('included') && !excludedIds.includes(disc.id))
        return false
      return true
    },
  }
}
