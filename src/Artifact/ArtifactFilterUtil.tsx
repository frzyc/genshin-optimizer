import { allSubstats } from "../Types/artifact"
import { sortKeys } from "../Util/ArtifactSort"
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