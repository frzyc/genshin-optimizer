import { IArtifact, MainStatKey, StatArr, StatDict, StatKey } from "./artifact"
import { ArtifactSetKey, SetNum, SlotKey } from "./consts"
import ICalculatedStats from "./ICalculatedStats"

export type ArtifactsBySlot = Dict<SlotKey, IArtifact[]>
export type PrunedArtifactSetEffects = Dict<ArtifactSetKey | "other", Dict<SetNum, StatDict>>
export type ArtifactSetEffects = Dict<ArtifactSetKey, Dict<SetNum, StatArr>>
export type SetFilter = { key: ArtifactSetKey | "", num: number }[]
export interface BuildSetting {
  setFilters: SetFilter,
  statFilters: MinMaxFilter,
  mainStatKeys: (MainStatKey | "")[],
  optimizationTarget: string[] | string,
  mainStatAssumptionLevel: number,
  useLockedArts: boolean,
  useEquippedArts: boolean,
  ascending: boolean
}
export type MinMaxFilter = Dict<StatKey, { min: number, max: number }>
export type ArtifactsBySlot = Dict<SlotKey, IArtifact[]>

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
  turbo: boolean
}
export interface Build {
  buildFilterVal: number,
  artifacts: {
    [key: string]: IArtifact
  }
}
