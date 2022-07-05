import { StatKey } from "../../KeyMap";
import { maxBuildsToShowDefault, maxBuildsToShowList } from "../../PageCharacter/CharacterDisplay/Tabs/TabOptimize/Build";
import { MainStatKey, SubstatKey } from "../../Types/artifact";
import { ArtifactSetKey, CharacterKey } from "../../Types/consts";
import { deepClone } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

export type ArtSetExclusion = Dict<Exclude<ArtifactSetKey, "PrayersForDestiny" | "PrayersForIllumination" | "PrayersForWisdom" | "PrayersToSpringtime"> | "rainbow", (2 | 4)[]>

export interface BuildSetting {
  artSetExclusion: ArtSetExclusion
  statFilters: Dict<StatKey, number>
  mainStatKeys: {
    sands: MainStatKey[],
    goblet: MainStatKey[],
    circlet: MainStatKey[],
    flower?: never,
    plume?: never,
  },
  optimizationTarget?: string[],
  mainStatAssumptionLevel: number,
  useExcludedArts: boolean,
  useEquippedArts: boolean,
  allowPartial: boolean,
  builds: string[][]
  buildDate: number,
  maxBuildsToShow: number,
  plotBase: MainStatKey | SubstatKey | "",
  compareBuild: boolean,
  levelLow: number,
  levelHigh: number,
}

export class BuildsettingDataManager extends DataManager<CharacterKey, string, BuildSetting, BuildSetting>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("buildSetting_")) {
        const [, charKey] = key.split("buildSetting_")
        // TODO: Parse the object and check if it is valid
        const buildSettingsObj = this.database.storage.get(key)
        if (!buildSettingsObj) {
          console.error("Entry", key, "is unrecoverable.", buildSettingsObj)
          this.database.storage.remove(key)
          continue
        }
        if (buildSettingsObj.builds && Array.isArray(buildSettingsObj.builds)) { // This should have been checked during parsing
          const newBuilds = buildSettingsObj.builds.map(build => {
            if (!Array.isArray(build)) return [] // This should have been parsed
            return build.filter(id => this.database.arts.get(id))
          }).filter(x => x.length)
          buildSettingsObj.builds = newBuilds
        }
        this.set(charKey as CharacterKey, buildSettingsObj)
      }
    }
  }
  toStorageKey(key: string): string {
    return `buildSetting_${key}`
  }
  get(key: CharacterKey) {
    const bs = super.get(key)
    if (bs) return bs
    const newBs = initialBuildSettings()
    this.set(key, newBs)
    return super.get(key)
  }

  set(key: CharacterKey, value: BuildSettingReducerAction) {
    const oldState = super.get(key) as BuildSetting
    super.set(key, validateBuildSetting(buildSettingsReducer(oldState, value)))
  }
}
type BSMainStatKey = {
  type: "mainStatKey", slotKey: "sands" | "goblet" | "circlet", mainStatKey?: MainStatKey
}
type BSArtSetExclusion = {
  type: "artSetExclusion", setKey: ArtifactSetKey | "rainbow", num: 2 | 4
}

export type BuildSettingReducerAction = BSMainStatKey | BSArtSetExclusion | Partial<BuildSetting>

const initialBuildSettings = (): BuildSetting => ({
  artSetExclusion: {},
  statFilters: {},
  mainStatKeys: { sands: [], goblet: [], circlet: [] },
  optimizationTarget: undefined,
  mainStatAssumptionLevel: 0,
  useExcludedArts: false,
  useEquippedArts: false,
  allowPartial: false,
  builds: [],
  buildDate: 0,
  maxBuildsToShow: 5,
  plotBase: "",
  compareBuild: true,
  levelLow: 0,
  levelHigh: 20,
})

function buildSettingsReducer(state: BuildSetting = initialBuildSettings(), action: BuildSettingReducerAction): BuildSetting {
  if ("type" in action) switch (action.type) {
    case 'mainStatKey': {
      const { slotKey, mainStatKey } = action
      const mainStatKeys = deepClone(state.mainStatKeys)//create a new object to update react dependencies
      //when mainstatkey is empty, then it resets the slot
      if (!mainStatKey) {
        mainStatKeys[slotKey] = []
        return { ...state, mainStatKeys }
      }

      if (state.mainStatKeys[slotKey].includes(mainStatKey))
        mainStatKeys[slotKey] = mainStatKeys[slotKey].filter(k => k !== mainStatKey)
      else
        mainStatKeys[slotKey].push(mainStatKey)
      return { ...state, mainStatKeys }
    }
    case "artSetExclusion": {
      const { setKey, num } = action
      const artSetExclusion = deepClone(state.artSetExclusion)
      if (!artSetExclusion[setKey]) artSetExclusion[setKey] = [num]
      else if (!artSetExclusion[setKey].includes(num)) artSetExclusion[setKey] = [...artSetExclusion[setKey], num]
      else {
        artSetExclusion[setKey] = artSetExclusion[setKey].filter(n => n !== num)
        if (!artSetExclusion[setKey].length) delete artSetExclusion[setKey]
      }
      return { ...state, artSetExclusion }
    }
    default:
      break;
  }
  return { ...state, ...action }
}

function validateBuildSetting(obj: any): BuildSetting {
  let { artSetExclusion, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, allowPartial, builds, buildDate, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh } = obj ?? {}

  if (typeof statFilters !== "object") statFilters = {}

  if (!mainStatKeys || !mainStatKeys.sands || !mainStatKeys.goblet || !mainStatKeys.circlet) {
    const tempmainStatKeys = initialBuildSettings().mainStatKeys
    if (Array.isArray(mainStatKeys)) {
      const [sands, goblet, circlet] = mainStatKeys
      if (sands) tempmainStatKeys.sands = [sands]
      if (goblet) tempmainStatKeys.goblet = [goblet]
      if (circlet) tempmainStatKeys.circlet = [circlet]
    }
    mainStatKeys = tempmainStatKeys
  }

  if (!optimizationTarget || !Array.isArray(optimizationTarget)) optimizationTarget = undefined
  if (typeof mainStatAssumptionLevel !== "number" || mainStatAssumptionLevel < 0 || mainStatAssumptionLevel > 20)
    mainStatAssumptionLevel = 0
  useExcludedArts = !!useExcludedArts
  useEquippedArts = !!useEquippedArts
  if (!Array.isArray(builds) || !builds.every(b => Array.isArray(b) && b.every(s => typeof s === "string"))) {
    builds = []
    buildDate = 0
  }
  if (!Number.isInteger(buildDate)) buildDate = 0
  if (!maxBuildsToShowList.includes(maxBuildsToShow)) maxBuildsToShow = maxBuildsToShowDefault
  if (typeof plotBase !== "string") plotBase = ""
  if (compareBuild === undefined) compareBuild = false
  if (levelLow === undefined) levelLow = 0
  if (levelHigh === undefined) levelHigh = 20
  if (!artSetExclusion) artSetExclusion = {};
  if (!allowPartial) allowPartial = false
  artSetExclusion = Object.fromEntries(Object.entries(artSetExclusion as ArtSetExclusion).map(([k, a]) => [k, [...new Set(a)]]).filter(([k, a]) => a.length))
  return { artSetExclusion, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, allowPartial, builds, buildDate, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh }
}
