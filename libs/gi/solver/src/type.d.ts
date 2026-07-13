import type { ArtSetExclusion } from '@genshin-optimizer/gi/db'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import type {
  ArtifactsBySlot,
  PlotData,
  RequestFilter,
  SolverBuild,
} from './common'

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
  /**
   * Maximum plotBase value among the current top-N builds; present only when
   * plotting. Each top-N build is a point (plot, value) that Pareto-dominates
   * every build with plot <= plotThreshold and value < threshold, so split
   * workers may only threshold-prune regions that are below *both*. Pruning
   * on `threshold` alone would truncate the plot's Pareto frontier at the
   * extrema (high-plot regions legitimately fall below the top-N threshold).
   */
  plotThreshold?: number
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
  builds: SolverBuild[]
  plotData?: PlotData | undefined
}
export interface Interim {
  resultType: 'interim'
  buildValues: number[] | undefined
  /** plotBase values aligned with `buildValues`; present only when plotting */
  buildPlots?: number[]
  /** The number of builds since last report, including failed builds */
  tested: number
  /** The number of builds that does not meet the min-filter requirement since last report */
  failed: number
  skipped: number
}
