import { ArtifactSortKey, artifactSortKeys, FilterOption, initialFilterOption } from "../../PageArtifact/ArtifactSort";
import { allSubstatKeys, SubstatKey } from "../../Types/artifact";
import { allArtifactRarities, allArtifactSets, allSlotKeys, LocationCharacterKey, locationCharacterKeys } from "../../Types/consts";
import { clamp } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataEntry } from "../DataEntry";
import { validateArr, validateObject } from "../validationUtil";


export type IDisplayArtifact = {
  filterOption: FilterOption
  ascending: boolean
  sortType: ArtifactSortKey
  effFilter: SubstatKey[],
  probabilityFilter: Dict<SubstatKey, number>,
}

function initialState() {
  return {
    filterOption: initialFilterOption(),
    ascending: false,
    sortType: artifactSortKeys[0],
    effFilter: [...allSubstatKeys],
    probabilityFilter: {},
  }
}

export class DisplayArtifactEntry extends DataEntry<"display_artifact", "display_artifact", IDisplayArtifact, IDisplayArtifact> {
  constructor(database: ArtCharDatabase) {
    super(database, "display_artifact", initialState, "display_artifact")
  }
  validate(obj: any): IDisplayArtifact | undefined {
    if (typeof obj !== "object") return
    let { filterOption, ascending, sortType, effFilter, probabilityFilter } = obj

    if (typeof filterOption !== "object") filterOption = initialFilterOption()
    else {
      let { artSetKeys, rarity, levelLow, levelHigh, slotKeys, mainStatKeys, substats, location, exclusion, locked, rvLow, rvHigh, lines } = filterOption
      artSetKeys = validateArr(artSetKeys, allArtifactSets, [])
      rarity = validateArr(rarity, allArtifactRarities)

      if (typeof levelLow !== "number") levelLow = 0
      else levelLow = clamp(levelLow, 0, 20)
      if (typeof levelHigh !== "number") levelHigh = 0
      else levelHigh = clamp(levelHigh, 0, 20)

      slotKeys = validateArr(slotKeys, allSlotKeys)
      mainStatKeys = validateArr(mainStatKeys, mainStatKeys, [])
      substats = validateArr(substats, allSubstatKeys, [])
      if (typeof location !== "string" || (![...locationCharacterKeys, "", "Inventory", "Equipped"].includes(location as LocationCharacterKey))) location = ""
      exclusion = validateArr(exclusion, ["excluded", "included"])
      locked = validateArr(locked, ["locked", "unlocked"])

      if (typeof rvLow !== "number") rvLow = 0
      if (typeof rvHigh !== "number") rvHigh = 900

      lines = validateArr(lines, [1, 2, 3, 4])

      filterOption = { artSetKeys, rarity, levelLow, levelHigh, slotKeys, mainStatKeys, substats, location, exclusion, locked, rvLow, rvHigh, lines } as FilterOption
    }

    if (typeof ascending !== "boolean") ascending = false
    if (!artifactSortKeys.includes(sortType)) sortType = artifactSortKeys[0]

    effFilter = validateArr(effFilter, allSubstatKeys)

    probabilityFilter = validateObject(probabilityFilter, k => allSubstatKeys.includes(k as SubstatKey), e => typeof e === "number")

    return { filterOption, ascending, sortType, effFilter, probabilityFilter } as IDisplayArtifact
  }
  set(value: Partial<IDisplayArtifact> | { action: "reset" }): boolean {
    if ("action" in value) {
      if (value.action === "reset")
        return super.set({ filterOption: initialFilterOption() })
      return false
    } else
      return super.set(value)
  }
}
