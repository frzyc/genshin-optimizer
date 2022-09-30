import Artifact from "../Data/Artifacts/Artifact";
import { allSubstatKeys, ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { allArtifactRarities, allSlotKeys, ArtifactRarity, ArtifactSetKey, LocationKey, SlotKey } from "../Types/consts";
import { FilterConfigs, SortConfigs } from "../Util/SortByFilters";
import { probability } from "./RollProbability";
export const artifactSortKeys = ["rarity", "level", "artsetkey", "efficiency", "mefficiency", "probability"] as const
export type ArtifactSortKey = typeof artifactSortKeys[number]

export type FilterLocationKey = LocationKey | "Equipped" | "Inventory"

export type FilterOption = {
  artSetKeys: ArtifactSetKey[],
  rarity: ArtifactRarity[],
  levelLow: number,
  levelHigh: number,
  slotKeys: SlotKey[],
  mainStatKeys: MainStatKey[],
  substats: SubstatKey[]
  location: FilterLocationKey
  exclusion: Array<"excluded" | "included">,
  locked: Array<"locked" | "unlocked">,
  rvLow: number,
  rvHigh: number,
  lines: Array<1 | 2 | 3 | 4>
}

export function initialFilterOption(): FilterOption {
  return {
    artSetKeys: [],
    rarity: [...allArtifactRarities],
    levelLow: 0,
    levelHigh: 20,
    slotKeys: [...allSlotKeys],
    mainStatKeys: [],
    substats: [],
    location: "",
    exclusion: ["excluded", "included"],
    locked: ["locked", "unlocked"],
    rvLow: 0,
    rvHigh: 900,
    lines: [1, 2, 3, 4]
  }
}

export function artifactSortConfigs(effFilterSet: Set<SubstatKey>, probabilityFilter): SortConfigs<ArtifactSortKey, ICachedArtifact> {
  return {
    rarity: art => art.rarity ?? 0,
    level: art => art.level ?? 0,
    artsetkey: art => art.setKey ?? "",
    efficiency: art => Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency,
    mefficiency: art => Artifact.getArtifactEfficiency(art, effFilterSet).maxEfficiency,
    probability: art => {
      if (!Object.keys(probabilityFilter).length) return 0
      const prob = (art as any).probability
      if (prob === undefined) return probability(art, probabilityFilter);
      return prob
    }
  }
}
export function artifactFilterConfigs(effFilterSet: Set<SubstatKey> = new Set(allSubstatKeys)): FilterConfigs<keyof FilterOption, ICachedArtifact> {
  return {
    exclusion: (art, filter) => {
      if (!filter.includes("included") && !art.exclude) return false
      if (!filter.includes("excluded") && art.exclude) return false
      return true
    },
    locked: (art, filter) => {
      if (!filter.includes("locked") && art.lock) return false
      if (!filter.includes("unlocked") && !art.lock) return false
      return true
    },
    location: (art, filter) => {
      if (!filter) return true
      if (filter === "Inventory" && !art.location) return true
      if (filter === "Equipped" && art.location) return true
      if (filter === art.location) return true
      return false
    },
    artSetKeys: (art, filter) => filter.length ? filter.includes(art.setKey) : true,
    slotKeys: (art, filter) => filter.includes(art.slotKey),
    mainStatKeys: (art, filter) => filter.length ? filter.includes(art.mainStatKey) : true,
    levelLow: (art, filter) => filter <= art.level,
    levelHigh: (art, filter) => filter >= art.level,
    // When RV is set to 0/900, allow all, just incase someone is doing some teehee haha with negative substats or stupid rolls
    rvLow: (art, filter) => filter === 0 ? true : filter <= Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency,
    rvHigh: (art, filter) => filter === 900 ? true : filter >= Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency,
    rarity: (art, filter) => filter.includes(art.rarity),
    substats: (art, filter) => {
      for (const filterKey of filter)
        if (filterKey && !art.substats.some(substat => substat.key === filterKey)) return false;
      return true
    },
    lines: (art, filter) => filter.includes(art.substats.filter(s => s.value).length),
  }
}
export const artifactSortMap: Partial<Record<ArtifactSortKey, ArtifactSortKey[]>> = {
  level: ["level", "rarity", "artsetkey"],
  rarity: ["rarity", "level", "artsetkey"],
  artsetkey: ["artsetkey", "rarity", "level"],
  efficiency: ["efficiency"],
  mefficiency: ["mefficiency"],
  probability: ["probability"],
}
