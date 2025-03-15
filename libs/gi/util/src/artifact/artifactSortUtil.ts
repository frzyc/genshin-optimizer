import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationCharacterKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSlotKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import type { IArtifact } from '@genshin-optimizer/gi/good'
import { getArtifactEfficiency } from './artifact'
export const artifactSortKeys = [
  'rarity',
  'level',
  'artsetkey',
  'efficiency',
  'mefficiency',
] as const
export type ArtifactSortKey = (typeof artifactSortKeys)[number]

export type ArtifactFilterOption = {
  artSetKeys: ArtifactSetKey[]
  rarity: ArtifactRarity[]
  levelLow: number
  levelHigh: number
  slotKeys: ArtifactSlotKey[]
  mainStatKeys: MainStatKey[]
  substats: SubstatKey[]
  locations: LocationCharacterKey[]
  showEquipped: boolean
  showInventory: boolean
  locked: Array<'locked' | 'unlocked'>
  rvLow: number
  rvHigh: number
  useMaxRV: boolean
  lines: Array<1 | 2 | 3 | 4>
  excluded?: Array<'excluded' | 'included'>
}

export function initialArtifactFilterOption(): ArtifactFilterOption {
  return {
    artSetKeys: [],
    rarity: [...allArtifactRarityKeys],
    levelLow: 0,
    levelHigh: 20,
    slotKeys: [...allArtifactSlotKeys],
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

export function artifactSortConfigs(
  effFilterSet: Set<SubstatKey>,
): SortConfigs<ArtifactSortKey, IArtifact> {
  return {
    rarity: (art) => art.rarity ?? 0,
    level: (art) => art.level ?? 0,
    artsetkey: (art) => art.setKey ?? '',
    efficiency: (art) =>
      getArtifactEfficiency(art, effFilterSet).currentEfficiency,
    mefficiency: (art) =>
      getArtifactEfficiency(art, effFilterSet).maxEfficiency,
  }
}
export function artifactFilterConfigs({
  effFilterSet = new Set(allSubstatKeys),
  excludedIds = [],
}: {
  effFilterSet?: Set<SubstatKey>
  excludedIds?: string[]
} = {}): FilterConfigs<keyof ArtifactFilterOption, IArtifact & { id: string }> {
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
    artSetKeys: (art, filter) =>
      filter.length ? filter.includes(art.setKey) : true,
    slotKeys: (art, filter) => filter.includes(art.slotKey),
    mainStatKeys: (art, filter) =>
      filter.length ? filter.includes(art.mainStatKey) : true,
    levelLow: (art, filter) => filter <= art.level,
    levelHigh: (art, filter) => filter >= art.level,
    // When RV is set to 0/900, allow all, just incase someone is doing some teehee haha with negative substats or stupid rolls
    rvLow: (art, filter, filters) => {
      if (filter === 0) return true
      filter = filter / 100
      const { useMaxRV } = filters
      const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
        art,
        effFilterSet,
      )
      const efficiencyToCompare = useMaxRV ? maxEfficiency : currentEfficiency
      return filter <= efficiencyToCompare
    },
    rvHigh: (art, filter, filters) => {
      if (filter === 900) return true
      filter = filter / 100
      const { useMaxRV } = filters
      const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
        art,
        effFilterSet,
      )
      const efficiencyToCompare = useMaxRV ? maxEfficiency : currentEfficiency
      return filter >= efficiencyToCompare
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
      [0, ...filter].includes(art.substats.filter((s) => s.value).length),
    excluded: (art, filter) => {
      if (!filter.includes('excluded') && excludedIds.includes(art.id))
        return false
      if (!filter.includes('included') && !excludedIds.includes(art.id))
        return false
      return true
    },
  }
}
export const artifactSortMap: Partial<
  Record<ArtifactSortKey, ArtifactSortKey[]>
> = {
  level: ['level', 'rarity', 'artsetkey'],
  rarity: ['rarity', 'level', 'artsetkey'],
  artsetkey: ['artsetkey', 'rarity', 'level'],
  efficiency: ['efficiency'],
  mefficiency: ['mefficiency'],
}
