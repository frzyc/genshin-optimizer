import { ICachedArtifact, MainStatKey, StatKey } from "./artifact"
import { ArtifactSetKey, SetNum, SlotKey } from "./consts"
import { BonusStats, ICalculatedStats } from "./stats"

export type ArtifactsBySlot = Dict<SlotKey, ICachedArtifact[]>
export type ArtifactSetEffects = Dict<ArtifactSetKey, Dict<SetNum, BonusStats>>
export type SetFilter = { key: ArtifactSetKey | "", num: number }[]
export interface BuildSetting {
  setFilters: SetFilter,
  statFilters: Dict<StatKey, number>
  mainStatKeys: {
    sands: MainStatKey[],
    goblet: MainStatKey[],
    circlet: MainStatKey[]
  },
  optimizationTarget: string[] | string,
  mainStatAssumptionLevel: number,
  useExcludedArts: boolean,
  useEquippedArts: boolean,
  builds: Array<string[]>,
  buildDate: number,
  maxBuildsToShow: number,
  plotBase: StatKey | ""
}
export type ArtifactsBySlot = Dict<SlotKey, ICachedArtifact[]>

export interface BuildRequest {
  splitArtifacts: ArtifactsBySlot,
  setFilters: SetFilter,
  minFilters: Dict<StatKey, Number>,
  initialStats: ICalculatedStats,
  artifactSetEffects: ArtifactSetEffects,
  maxBuildsToShow: number,
  optimizationTarget: string | string[],
  plotBase: StatKey | ""
}
export interface Build {
  buildFilterVal: number,
  artifacts: {
    [key: string]: ICachedArtifact
  }
}
