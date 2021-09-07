import { ICachedArtifact, MainStatKey, StatKey } from "./artifact"
import { ArtifactSetKey, SetNum, SlotKey } from "./consts"
import { BonusStats, ICalculatedStats } from "./stats"

export type ArtifactsBySlot = Dict<SlotKey, ICachedArtifact[]>
export type ArtifactSetEffects = Dict<ArtifactSetKey, Dict<SetNum, BonusStats>>
export type SetFilter = { key: ArtifactSetKey | "", num: number }[]
export interface BuildSetting {
  setFilters: SetFilter,
  statFilters: MinMaxFilter,
  mainStatKeys: {
    sands: MainStatKey[],
    goblet: MainStatKey[],
    circlet: MainStatKey[]
  },
  optimizationTarget: string[] | string,
  mainStatAssumptionLevel: number,
  useExcludedArts: boolean,
  useEquippedArts: boolean,
  ascending: boolean
}
export type MinMaxFilter = Dict<StatKey, { min: number, max: number }>
export type ArtifactsBySlot = Dict<SlotKey, ICachedArtifact[]>

export interface BuildRequest {
  splitArtifacts: ArtifactsBySlot,
  setFilters: SetFilter,
  minFilters: Dict<StatKey, Number>,
  maxFilters: Dict<StatKey, Number>,
  initialStats: ICalculatedStats,
  artifactSetEffects: ArtifactSetEffects,
  maxBuildsToShow: number,
  optimizationTarget: string | string[],
  ascending: boolean,
}
export interface Build {
  buildFilterVal: number,
  artifacts: {
    [key: string]: ICachedArtifact
  }
}
