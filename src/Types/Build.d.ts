import { IArtifact, MainStatKey, StatKey } from "./artifact"
import { ArtifactSetKey, SetNum, SlotKey } from "./consts"
import { BonusStats, ICalculatedStats } from "./stats"

export type ArtifactsBySlot = Dict<SlotKey, IArtifact[]>
export type ArtifactSetEffects = Dict<ArtifactSetKey, Dict<SetNum, BonusStats>>
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
