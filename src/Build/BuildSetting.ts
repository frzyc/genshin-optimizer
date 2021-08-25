import { BuildSetting } from "../Types/Build";

export const initialBuildSettings = (): BuildSetting => ({
  setFilters: [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }],
  statFilters: {},
  mainStatKeys: ["", "", ""],
  optimizationTarget: "finalATK",
  mainStatAssumptionLevel: 0,
  useLockedArts: false,
  useEquippedArts: false,
  ascending: false,
})