import { NumNode } from '../../../../Formula/type'
import { assertUnreachable } from '../../../../Util/Util'
import { ArtSetExclusion } from './BuildSetting'
import { ArtifactsBySlot, artSetPerm, Build, countBuilds, filterArts, filterFeasiblePerm, PlotData, RequestFilter } from "./common"
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
      result = { command: "split", filter: splitWorker.split(data.threshold, data.minCount, data.filter) }
      break
    case "iterate":
      const { threshold, filter } = data
      computeWorker.compute(threshold, filter)
      result = { command: "iterate" }
      break
    case "finalize":
      computeWorker.refresh(true)
      const { builds, plotData } = computeWorker
      result = { command: "finalize", builds, plotData }
      break
    case "count":
      {
        const { exclusion } = data, arts = computeWorker.arts
        const setPerm = filterFeasiblePerm(artSetPerm(exclusion, [...new Set(Object.values(arts.values).flatMap(x => x.map(x => x.set!)))]), arts)
        let count = 0
        for (const perm of setPerm)
          count += countBuilds(filterArts(arts, perm))
        result = { command: "count", count }
        break
      }
    default: assertUnreachable(command)
  }
  postMessage({ id, ...result });
}

export type WorkerCommand = Setup | Split | Iterate | Finalize | Count
export type WorkerResult = InterimResult | SplitResult | IterateResult | FinalizeResult | CountResult

export interface Setup {
  command: "setup"

  id: number
  arts: ArtifactsBySlot

  optimizationTarget: NumNode
  filters: { value: NumNode, min: number }[]
  plotBase: NumNode | undefined,
  maxBuilds: number
}
export interface Split {
  command: "split"
  threshold: number
  minCount: number
  filter?: RequestFilter
}
export interface Iterate {
  command: "iterate"
  threshold: number
  filter: RequestFilter
}

export interface Finalize {
  command: "finalize"
}
export interface Count {
  command: "count"
  exclusion: ArtSetExclusion
}
export interface SplitResult {
  command: "split"
  filter: RequestFilter | undefined
}
export interface IterateResult {
  command: "iterate"
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
export interface InterimResult {
  command: "interim"
  buildValues: number[] | undefined
  /** The number of builds since last report, including failed builds */
  tested: number
  /** The number of builds that does not meet the min-filter requirement since last report */
  failed: number
  skipped: number
}
