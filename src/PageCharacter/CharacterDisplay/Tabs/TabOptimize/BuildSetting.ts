import { useCallback, useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../../../../Database/Database";
import { StatKey } from "../../../../KeyMap";
import { MainStatKey, SubstatKey } from "../../../../Types/artifact";
import { ArtifactSetKey, CharacterKey } from "../../../../Types/consts";
import { deepClone } from "../../../../Util/Util";
import { maxBuildsToShowDefault, maxBuildsToShowList } from "./Build";
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
export const initialBuildSettings = (): BuildSetting => ({
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

export default function useBuildSetting(characterKey: CharacterKey) {
  const { database } = useContext(DatabaseContext)
  const [buildSetting, setBuildSetting] = useState(database._getBuildSetting(characterKey))
  useEffect(() => setBuildSetting(database._getBuildSetting(characterKey)), [database, characterKey])
  useEffect(() =>
    database.followBuildSetting(characterKey, setBuildSetting),
    [characterKey, setBuildSetting, database])
  const buildSettingDispatch = useCallback(action => characterKey && database.updateBuildSetting(characterKey, action), [characterKey, database],)

  return { buildSetting: buildSetting as BuildSetting, buildSettingDispatch }
}

export function buildSettingsReducer(state: BuildSetting = initialBuildSettings(), action): BuildSetting {
  switch (action.type) {
    case 'mainStatKey': {
      const { slotKey, mainStatKey } = action
      const mainStatKeys = { ...state.mainStatKeys }//create a new object to update react dependencies
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

export function validateBuildSetting(obj: any): BuildSetting {
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
