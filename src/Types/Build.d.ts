
export type ArtifactsBySlot = Dict<SlotKey, IArtifact[]>
export type PrunedArtifactSetEffects = Dict<ArtifactSet | "other", Dict<SetNum, StatDict>>
export type ArtifactSetEffects = Dict<ArtifactSet, Dict<SetNum, StatArr>>
export type SetFilter = { key: ArtifactSet, num: number }[]
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
