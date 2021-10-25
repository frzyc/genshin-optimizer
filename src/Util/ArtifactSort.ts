import Artifact from "../Artifact/Artifact";
import { ArtifactSheet } from "../Artifact/ArtifactSheet";
import { ArtCharDatabase } from "../Database/Database";
import { SubstatKey } from "../Types/artifact";
import { ArtifactSetKey } from "../Types/consts";
import { SortOptions } from "./SortByFilters";
export const sortKeys = ["rarity", "level", "artsetkey", "efficiency", "mefficiency"]
export default function ArtifactSortOptions(database: ArtCharDatabase, artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>, effFilterSet: Set<SubstatKey>): SortOptions {
  return {
    rarity: {
      getValue: (id) => database._getArt(id)?.rarity ?? 0,
      tieBreaker: "level"
    },
    level: {
      getValue: (id) => database._getArt(id)?.level ?? 0,
      tieBreaker: "artsetkey"
    },
    artsetkey: {
      getValue: (id) => database._getArt(id)?.setKey ?? "",
      tieBreaker: "level"
    },
    efficiency: {
      getValue: (id) => {
        const art = database._getArt(id)
        if (!art) return 0
        return Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency
      }
    },
    mefficiency: {
      getValue: (id) => {
        const art = database._getArt(id)
        if (!art) return 0
        return Artifact.getArtifactEfficiency(art, effFilterSet).maxEfficiency
      }
    }
  }
}