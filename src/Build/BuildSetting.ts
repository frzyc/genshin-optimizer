import { BuildSetting } from "../Types/Build";

export const initialBuildSettings = (): BuildSetting => ({
  setFilters: [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }],
  statFilters: {},
  mainStatKeys: { sands: [], goblet: [], circlet: [] },
  optimizationTarget: "",
  mainStatAssumptionLevel: 0,
  useExcludedArts: false,
  useEquippedArts: false,
  builds: [],
  buildDate: 0,
  maxBuildsToShow: 5,
  plotBase: "",
  compareBuild: true,
  levelLow: 0,
  levelHigh: 20,
})