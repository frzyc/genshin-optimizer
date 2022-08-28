import { ArtSetExclusion } from '../../../../Database/Data/BuildsettingData'
import { NumNode } from '../../../../Formula/type'
import { assertUnreachable } from '../../../../Util/Util'
import { ArtifactsBySlot, artSetPerm, Build, countBuilds, filterArts, filterFeasiblePerm, PlotData, RequestFilter } from "./common"
import { ComputeWorker } from "./ComputeWorker"
import { DefaultSplitWorker } from "./DefaultSplitWorker"

let id: number, splitWorker: SplitWorker, computeWorker: ComputeWorker

function post(command: WorkerResult): void { postMessage({ id, ...command }) }

onmessage = async ({ data }: { data: WorkerCommand }) => {
  const { command } = data
  switch (command) {
    case "setup":
      id = data.id
      splitWorker = new DefaultSplitWorker(data, post)
      computeWorker = new ComputeWorker(data, post)
      return post({ command: "iterate" })
    case "split": {
      if (data.filter) splitWorker.addFilter(data.filter)
      const filter = await splitWorker.split(data.threshold, data.minCount)
      return post({ command: "split", filter })
    }
    case "iterate": {
      const { threshold, filter } = data
      computeWorker.compute(threshold, filter)
      return post({ command: "iterate" })
    }
    case "finalize": {
      computeWorker.refresh(true)
      const { builds, plotData } = computeWorker
      return post({ command: "finalize", builds, plotData })
    }
    case "count": {
      const { exclusion } = data, arts = computeWorker.arts
      const setPerm = filterFeasiblePerm(artSetPerm(exclusion, [...new Set(Object.values(arts.values).flatMap(x => x.map(x => x.set!)))]), arts)
      let counts = data.arts.map(_ => 0)
      for (const perm of setPerm)
        data.arts.forEach((arts, i) => counts[i] += countBuilds(filterArts(arts, perm)));
      return post({ command: "count", counts })
    }
    default: assertUnreachable(command)
  }
}

export interface SplitWorker {
  addFilter(filter: RequestFilter): void
  split(newThreshold: number, minCount: number): Promise<RequestFilter | undefined>
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
  arts: ArtifactsBySlot[]
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
  counts: number[]
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
