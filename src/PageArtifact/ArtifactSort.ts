import { ICachedArtifact, MainStatKey } from "../Types/artifact";
import { allArtifactRarities, allSlotKeys, ArtifactRarity, ArtifactSetKey, CharacterKey, SlotKey } from "../Types/consts";
import { FilterConfigs, SortConfigs } from "../Util/SortByFilters";
import Artifact from "../Data/Artifacts/Artifact";
import { probability } from "./RollProbability";
import { SubstatKey } from "../Types/artifact";
export const artifactSortKeys = ["rarity", "level", "artsetkey", "efficiency", "mefficiency", "probability"] as const
export const artifactSortKeysTC = ["probability"] as const
export type ArtifactSortKey = typeof artifactSortKeys[number]
export type FilterOption = {
  artSetKeys: ArtifactSetKey[],
  rarity: ArtifactRarity[],
  levelLow: number,
  levelHigh: number,
  slotKeys: SlotKey[],
  mainStatKeys: MainStatKey[],
  substats: SubstatKey[]
  location: CharacterKey | "Inventory" | "Equipped" | ""
  exclusion: Array<"excluded" | "included">,
  locked: Array<"locked" | "unlocked">,
}

type ArtifactSortFilter = {
  filterOption: FilterOption
  ascending: boolean
  sortType: ArtifactSortKey
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
  }
}
export const initialArtifactSortFilter = (): ArtifactSortFilter => ({
  filterOption: initialFilterOption(),
  ascending: false,
  sortType: artifactSortKeys[0],
})

export function artifactSortConfigs(effFilterSet: Set<SubstatKey>, probabilityFilter): SortConfigs<ArtifactSortKey, ICachedArtifact> {
  return {
    rarity: {
      getValue: art => art.rarity ?? 0,
      tieBreaker: "level"
    },
    level: {
      getValue: art => art.level ?? 0,
      tieBreaker: "artsetkey"
    },
    artsetkey: {
      getValue: art => art.setKey ?? "",
      tieBreaker: "level"
    },
    efficiency: {
      getValue: art => Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency
    },
    mefficiency: {
      getValue: art => Artifact.getArtifactEfficiency(art, effFilterSet).maxEfficiency
    },
    probability: {
      getValue: art => {
        if (!Object.keys(probabilityFilter).length) return 0
        const prob = (art as any).probability
        if (prob === undefined) return probability(art, probabilityFilter);
        return prob
      }
    }
  }
}
export function artifactFilterConfigs(): FilterConfigs<keyof FilterOption, ICachedArtifact> {
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
    rarity: (art, filter) => filter.includes(art.rarity),
    substats: (art, filter) => {
      for (const filterKey of filter)
        if (filterKey && !art.substats.some(substat => substat.key === filterKey)) return false;
      return true
    }
  }
}
