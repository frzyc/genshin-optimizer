import Artifact from "../../Data/Artifacts/Artifact";
import { maxBuildsToShowDefault, maxBuildsToShowList } from "../../PageCharacter/CharacterDisplay/Tabs/TabOptimize/Build";
import { MainStatKey } from "../../Types/artifact";
import { allCharacterKeys, ArtifactSetKey, CharacterKey } from "../../Types/consts";
import { deepClone, deepFreeze } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

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
  optimizationTarget?: string[]
  mainStatAssumptionLevel: number
  useExcludedArts: boolean
  useEquippedArts: boolean
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
    let { artSetExclusion, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, allowPartial, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh } = (obj as any) ?? {}

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
    useExcludedArts = !!useExcludedArts
    useEquippedArts = !!useEquippedArts
    if (!maxBuildsToShowList.includes(maxBuildsToShow)) maxBuildsToShow = maxBuildsToShowDefault
    if (!plotBase || !Array.isArray(plotBase)) plotBase = undefined
    if (compareBuild === undefined) compareBuild = false
    if (levelLow === undefined) levelLow = 0
    if (levelHigh === undefined) levelHigh = 20
    if (!artSetExclusion) artSetExclusion = {};
    if (!allowPartial) allowPartial = false
    artSetExclusion = Object.fromEntries(Object.entries(artSetExclusion as ArtSetExclusion).map(([k, a]) => [k, [...new Set(a)]]).filter(([_, a]) => a.length))
    return { artSetExclusion, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, allowPartial, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh }
  }
  get(key: CharacterKey) {
    return super.get(key) ?? initialBuildSettings
  }
}

const initialBuildSettings: BuildSetting = deepFreeze({
  artSetExclusion: {},
  statFilters: {},
  mainStatKeys: { sands: [...Artifact.slotMainStats("sands")], goblet: [...Artifact.slotMainStats("goblet")], circlet: [...Artifact.slotMainStats("circlet")] },
  optimizationTarget: undefined,
  mainStatAssumptionLevel: 0,
  useExcludedArts: false,
  useEquippedArts: false,
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
