import { allSubstats } from "../Types/artifact"

export const sortKeys = ["rarity", "level", "efficiency", "mefficiency"]
export const initialFilter = () => ({
  filterArtSetKey: "",
  filterStars: [3, 4, 5],
  filterLevelLow: 0,
  filterLevelHigh: 20,
  filterSlotKey: "",
  filterMainStatKey: "",
  filterSubstats: ["", "", "", ""],
  filterLocation: "",
  filterExcluded: "",
  ascending: false,
  sortType: sortKeys[0],
  maxNumArtifactsToDisplay: 48,
  effFilter: [...allSubstats]
})