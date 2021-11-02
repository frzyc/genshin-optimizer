import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { allArtifactRarities, ArtifactRarity, ArtifactSetKey, CharacterKey, SlotKey } from "../Types/consts";
import { FilterConfigs, SortConfigs } from "../Util/SortByFilters";
import Artifact from "./Artifact";
import { probability } from "./RollProbability";
export const artifactSortKeys = ["rarity", "level", "artsetkey", "efficiency", "mefficiency", "probability"] as const
export const artifactSortKeysTC = ["probability"] as const
export type ArtifactSortKey = typeof artifactSortKeys[number]
export type FilterOption = {
  artSetKey: ArtifactSetKey | "",
  rarity: ArtifactRarity[],
  levelLow: number,
  levelHigh: number,
  slotKey: SlotKey | "",
  mainStatKey: MainStatKey | ""
  substats: Array<SubstatKey | "">
  location: CharacterKey | "Inventory" | "Equipped" | ""
  excluded: "excluded" | "included" | "",
}

type ArtifactSortFilter = {
  filterOption: FilterOption
  ascending: boolean
  sortType: ArtifactSortKey
}
export const initialArtifactSortFilter = (): ArtifactSortFilter => ({
  filterOption: {
    artSetKey: "",
    rarity: [...allArtifactRarities],
    levelLow: 0,
    levelHigh: 20,
    slotKey: "",
    mainStatKey: "",
    substats: ["", "", "", ""],
    location: "",
    excluded: "",
  },
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
    excluded: (art, filter) => {
      if (filter === "excluded" && !art.exclude) return false
      if (filter === "included" && art.exclude) return false
      return true
    },
    location: (art, filter) => {
      if (filter === "Inventory") {
        if (art.location) return false;
      } else if (filter === "Equipped") {
        if (!art.location) return false;
      } else if (filter !== art.location) return false;
      return true
    },
    artSetKey: (art, filter) => !filter || filter === art.setKey,
    slotKey: (art, filter) => !filter || filter === art.slotKey,
    mainStatKey: (art, filter) => !filter || filter === art.mainStatKey,
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