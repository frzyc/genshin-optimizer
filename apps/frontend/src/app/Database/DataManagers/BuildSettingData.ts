import { allCharacterKeys, allLocationCharacterKeys, ArtifactSetKey, CharacterKey, LocationKey } from "@genshin-optimizer/consts";
import Artifact from "../../Data/Artifacts/Artifact";
import { maxBuildsToShowDefault, maxBuildsToShowList } from "../../PageCharacter/CharacterDisplay/Tabs/TabOptimize/Build";
import { MainStatKey } from "../../Types/artifact";
import { deepClone, deepFreeze } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { validateArr } from "../validationUtil";

export type ArtSetExclusion = Dict<Exclude<ArtifactSetKey, "PrayersForDestiny" | "PrayersForIllumination" | "PrayersForWisdom" | "PrayersToSpringtime"> | "rainbow", (2 | 4)[]>

export interface StatFilterSetting {
  value: number
  disabled: boolean
}
export type StatFilters = Dict<string, StatFilterSetting[]>
export interface BuildSetting {
  artSetExclusion: ArtSetExclusion
  statFilters: StatFilters
  mainStatKeys: {
    sands: MainStatKey[]
    goblet: MainStatKey[]
    circlet: MainStatKey[]
    flower?: never
    plume?: never
  }
  allowLocations: LocationKey[]
  artExclusion: string[]
  optimizationTarget?: string[]
  mainStatAssumptionLevel: number
  allowPartial: boolean
  maxBuildsToShow: number
  plotBase?: string[]
  compareBuild: boolean
  levelLow: number
  levelHigh: number
}

export class BuildSettingDataManager extends DataManager<CharacterKey, "buildSettings", BuildSetting, BuildSetting> {
  constructor(database: ArtCharDatabase) {
    super(database, "buildSettings")
    for (const key of this.database.storage.keys)
      if (key.startsWith("buildSetting_") && !this.set(key.split("buildSetting_")[1] as CharacterKey, {}))
        this.database.storage.remove(key)
  }
  toStorageKey(key: string): string {
    return `buildSetting_${key}`
  }
  validate(obj: object, key: string): BuildSetting | undefined {
    if (!allCharacterKeys.includes(key as CharacterKey)) return
    if (typeof obj !== "object") return
    let { artSetExclusion, artExclusion, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, allowLocations, allowPartial, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh } = obj as BuildSetting

    if (typeof statFilters !== "object") statFilters = {}

    if (!mainStatKeys || !mainStatKeys.sands || !mainStatKeys.goblet || !mainStatKeys.circlet)
      mainStatKeys = deepClone(initialBuildSettings.mainStatKeys)
    else { // make sure the arrays are not empty
      (["sands", "goblet", "circlet"] as const).forEach(sk => {
        if (!mainStatKeys[sk].length) mainStatKeys[sk] = [...Artifact.slotMainStats(sk)]
      })
    }

    if (!optimizationTarget || !Array.isArray(optimizationTarget)) optimizationTarget = undefined
    if (typeof mainStatAssumptionLevel !== "number" || mainStatAssumptionLevel < 0 || mainStatAssumptionLevel > 20)
      mainStatAssumptionLevel = 0

    if (!artExclusion || !Array.isArray(artExclusion)) artExclusion = []
    else artExclusion = [...(new Set(artExclusion))].filter(id => this.database.arts.keys.includes(id))

    allowLocations = validateArr(allowLocations, allLocationCharacterKeys.filter(k => k !== key), []).filter(lk => this.database.chars.get(this.database.chars.LocationToCharacterKey(lk)))

    if (!maxBuildsToShowList.includes(maxBuildsToShow as typeof maxBuildsToShowList[number])) maxBuildsToShow = maxBuildsToShowDefault
    if (!plotBase || !Array.isArray(plotBase)) plotBase = undefined
    if (compareBuild === undefined) compareBuild = false
    if (levelLow === undefined) levelLow = 0
    if (levelHigh === undefined) levelHigh = 20
    if (!artSetExclusion) artSetExclusion = {};
    if (!allowPartial) allowPartial = false
    artSetExclusion = Object.fromEntries(Object.entries(artSetExclusion as ArtSetExclusion).map(([k, a]) => [k, [...new Set(a)]]).filter(([_, a]) => a.length))
    return { artSetExclusion, artExclusion, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, allowLocations: allowLocations, allowPartial, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh }
  }
  get(key: CharacterKey) {
    return super.get(key) ?? initialBuildSettings
  }
}

const initialBuildSettings: BuildSetting = deepFreeze({
  artSetExclusion: {},
  artExclusion: [],
  statFilters: {},
  mainStatKeys: { sands: [...Artifact.slotMainStats("sands")], goblet: [...Artifact.slotMainStats("goblet")], circlet: [...Artifact.slotMainStats("circlet")] },
  optimizationTarget: undefined,
  mainStatAssumptionLevel: 0,
  allowLocations: [],
  allowPartial: false,
  maxBuildsToShow: 5,
  plotBase: undefined,
  compareBuild: true,
  levelLow: 0,
  levelHigh: 20,
})

export function handleArtSetExclusion(currentArtSetExclusion: ArtSetExclusion, setKey: ArtifactSetKey | "rainbow", num: 2 | 4) {
  const artSetExclusion = deepClone(currentArtSetExclusion)
  if (!artSetExclusion[setKey]) artSetExclusion[setKey] = [num]
  else if (!artSetExclusion[setKey].includes(num)) artSetExclusion[setKey] = [...artSetExclusion[setKey], num]
  else {
    artSetExclusion[setKey] = artSetExclusion[setKey].filter(n => n !== num)
    if (!artSetExclusion[setKey].length) delete artSetExclusion[setKey]
  }
  return artSetExclusion
}
