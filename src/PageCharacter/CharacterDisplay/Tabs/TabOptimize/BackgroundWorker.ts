import { LinearForm } from '../../../../Formula/linearUpperBound'
import { NumNode } from '../../../../Formula/type'
import { ArtifactSetKey } from '../../../../Types/consts'
import { assertUnreachable } from '../../../../Util/Util'
import { ArtSetExclusion } from './BuildSetting'
import { ArtifactsBySlot, artSetPerm, Build, countBuilds, DynStat, filterArts, filterFeasiblePerm, PlotData, RequestFilter } from "./common"
import { ComputeWorker } from "./ComputeWorker"
import { SplitWorker } from "./SplitWorker"

let id: number, splitWorker: SplitWorker, computeWorker: ComputeWorker

onmessage = ({ data }: { data: WorkerCommand }) => {
  const command = data.command
  let result: WorkerResult
  switch (command) {
    case "setup":
      id = data.id
      const callback = (interim: InterimResult) => postMessage({ id, ...interim })
      splitWorker = new SplitWorker(data, callback)
      computeWorker = new ComputeWorker(data, callback)
      result = { command: "iterate" }
      break
    case "split":
      result = { command: "split", subproblems: splitWorker.split(data), ready: splitWorker.subproblems.length === 0 }
      break
    case "splitwork":
      result = { command: 'split', subproblems: splitWorker.splitWork(data), ready: splitWorker.subproblems.length === 0 }
      break
    case "iterate":
      const { threshold, subproblem } = data
      computeWorker.compute(threshold, subproblem)
      result = { command: "iterate" }
      break
    case "finalize":
      computeWorker.refresh(true)
      const { builds, plotData } = computeWorker
      result = { command: "finalize", builds, plotData }
      break
    // case "count":
    //   {
    //     console.log('count stuff', id)
    //     const { exclusion } = data, arts = computeWorker.arts
    //     const setPerm = filterFeasiblePerm(artSetPerm(exclusion, [...new Set(Object.values(arts.values).flatMap(x => x.map(x => x.set!)))]), arts)
    //     let count = 0
    //     for (const perm of setPerm)
    //       count += countBuilds(filterArts(arts, perm))
    //     result = { command: "count", count }
    //     console.log('count stuff done', id)
    //     break
    //   }
    default: assertUnreachable(command)
  }
  postMessage({ id, ...result });
}


export type ArtSetExclusionFull = Dict<Exclude<ArtifactSetKey, "PrayersForDestiny" | "PrayersForIllumination" | "PrayersForWisdom" | "PrayersToSpringtime"> | "uniqueKey", number[]>
export type SubProblem = SubProblemNC | SubProblemWC
export type SubProblemNC = {
  cache: false,
  optimizationTarget: NumNode,
  constraints: { value: NumNode, min: number }[],
  artSetExclusion: ArtSetExclusionFull,

  filter: RequestFilter,
}
export type SubProblemWC = {
  cache: true,
  optimizationTarget: NumNode,
  constraints: { value: NumNode, min: number }[],
  artSetExclusion: ArtSetExclusionFull,

  filter: RequestFilter,
  cachedCompute: CachedCompute
}
export type CachedCompute = {
  maxEst: number[],
  lin: LinearForm[],
  lower: DynStat,
  upper: DynStat
}

export type WorkerCommand = Setup | Split | SplitWork | Iterate | Finalize
// export type WorkerResult = InterimResult | SplitResult | IterateResult | FinalizeResult | CountResult
export type WorkerResult = InterimResult | SplitResult | IterateResult | FinalizeResult

export interface Setup {
  command: "setup"

  id: number
  arts: ArtifactsBySlot

  optimizationTarget: NumNode
  filters: { value: NumNode, min: number }[]
  artSetExclusion: ArtSetExclusion
  plotBase: NumNode | undefined,
  maxBuilds: number
}
export interface Split {
  command: "split"
  threshold: number
  minCount: number
  maxIter: number

  subproblem?: SubProblem
}
export interface SplitWork {
  command: "splitwork"
  threshold: number
  numSplits: number

  subproblem?: SubProblem
}
export interface Iterate {
  command: "iterate"
  threshold: number

  subproblem: SubProblem
}
export interface Finalize {
  command: "finalize"
}


// export interface Count {
//   command: "count"
//   exclusion: ArtSetExclusion
// }

export interface InterimResult {
  command: "interim"
  buildValues: number[] | undefined
  /** The number of builds since last report, including failed builds */
  tested: number
  /** The number of builds that does not meet the min-filter requirement since last report */
  failed: number
  skipped: number
}
export interface IterateResult {
  command: "iterate"
}
export interface SplitResult {
  command: "split"
  ready: boolean
  subproblems: SubProblem[]
}
export interface FinalizeResult {
  command: "finalize"
  builds: Build[]
  plotData?: PlotData
}
export interface CountResult {
  command: "count"
  count: number
}
