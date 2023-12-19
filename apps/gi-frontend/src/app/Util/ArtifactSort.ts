import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  LocationCharacterKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/consts'
import { allArtifactSlotKeys, allSubstatKeys } from '@genshin-optimizer/consts'
import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/util'
import type { ICachedArtifact } from '../Types/artifact'
import type { ArtifactRarity } from '../Types/consts'
import { allArtifactRarities } from '../Types/consts'
import Artifact from './Artifact'
export const artifactSortKeys = [
  'rarity',
  'level',
  'artsetkey',
  'efficiency',
  'mefficiency',
] as const
export type ArtifactSortKey = (typeof artifactSortKeys)[number]

export type FilterOption = {
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
  lines: Array<1 | 2 | 3 | 4>
}

export function initialFilterOption(): FilterOption {
  return {
    artSetKeys: [],
    rarity: [...allArtifactRarities],
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
    lines: [1, 2, 3, 4],
  }
}

export function artifactSortConfigs(
  effFilterSet: Set<SubstatKey>
): SortConfigs<ArtifactSortKey, ICachedArtifact> {
  return {
    rarity: (art) => art.rarity ?? 0,
    level: (art) => art.level ?? 0,
    artsetkey: (art) => art.setKey ?? '',
    efficiency: (art) =>
      Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency,
    mefficiency: (art) =>
      Artifact.getArtifactEfficiency(art, effFilterSet).maxEfficiency,
  }
}
export function artifactFilterConfigs(
  effFilterSet: Set<SubstatKey> = new Set(allSubstatKeys)
): FilterConfigs<keyof FilterOption, ICachedArtifact> {
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
    rvLow: (art, filter) =>
      filter === 0
        ? true
        : filter <=
          Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency,
    rvHigh: (art, filter) =>
      filter === 900
        ? true
        : filter >=
          Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency,
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
