import { IArtifact, MainStatKey, StatArr, StatDict, StatKey } from "./artifact"
import { ArtifactSetKey, SetNum, SlotKey } from "./consts"

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
