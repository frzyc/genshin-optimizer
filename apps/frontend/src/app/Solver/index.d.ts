import type { ArtSetExclusion } from '../Database/DataManagers/BuildSettingData'
import type { OptNode } from '../Formula/optimization'
import type { ArtifactsBySlot, Build, PlotData, RequestFilter } from './common'

export type OptProblemInput = {
  arts: ArtifactsBySlot
  optimizationTarget: OptNode
  constraints: { value: OptNode; min: number }[]
  exclusion: ArtSetExclusion

  topN: number
  plotBase?: OptNode
}

export type WorkerCommand =
  | Setup
  | Split
  | Iterate
  | Threshold
  | Finalize
  | Count
export type WorkerResult = Interim | CountResult | FinalizeResult | Done | Error

export interface Setup {
  command: 'setup'

  arts: ArtifactsBySlot

  optTarget: OptNode
  constraints: { value: OptNode; min: number }[]
  plotBase: OptNode | undefined
  topN: number
}
export interface Split {
  command: 'split'
  filter: RequestFilter
  maxIterateSize: number
}
export interface Iterate {
  command: 'iterate'
  filter: RequestFilter
}
export interface Threshold {
  command: 'threshold'
  threshold: number
}
export interface Finalize {
  command: 'finalize'
}
export interface Count {
  command: 'count'
  exclusion: ArtSetExclusion
  maxIterateSize: number
}
export interface Done {
  resultType: 'done'
}
export interface Error {
  resultType: 'err'
  message: string
}
export interface CountResult {
  resultType: 'count'
  count: number
}
export interface FinalizeResult {
  resultType: 'finalize'
  builds: Build[]
  plotData?: PlotData
}
export interface Interim {
  resultType: 'interim'
  buildValues: number[] | undefined
  /** The number of builds since last report, including failed builds */
  tested: number
  /** The number of builds that does not meet the min-filter requirement since last report */
  failed: number
  skipped: number
}
