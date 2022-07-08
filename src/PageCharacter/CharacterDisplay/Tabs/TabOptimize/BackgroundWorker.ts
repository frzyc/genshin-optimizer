import { NumNode } from '../../../../Formula/type'
import { assertUnreachable } from '../../../../Util/Util'
import { ArtSetExclusion } from './BuildSetting'
import { ArtifactsBySlot, ArtifactsBySlotVec, artSetPerm, Build, countBuilds, filterArts, filterFeasiblePerm, PlotData } from "./common"
import { ComputeWorker } from "./ComputeWorker"
import { SplitWorker } from "./SplitWorker"
import { SubProblem } from './subproblemUtil'

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
      // console.log(id, splitWorker.subproblems)
      break
    case "iterate":
      const { threshold, subproblem } = data
      computeWorker.computeU(threshold, subproblem)
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
        let counts = data.arts.map(_ => 0)
        for (const perm of setPerm)
          data.arts.forEach((arts, i) => counts[i] += countBuilds(filterArts(arts, perm)));
        result = { command: "count", counts }
        break
      }
    case "share":
      const oo = splitWorker.popOne()
      result = { command: 'share', subproblem: oo, sender: data.sender }
      break
    default: assertUnreachable(command)
  }
  postMessage({ id, ...result });
}


export type WorkerCommand = Setup | Split | Iterate | Finalize | Share | Count
export type WorkerResult = InterimResult | SplitResult | IterateResult | FinalizeResult | ShareResult | CountResult

export interface Setup {
  command: "setup"

  id: number
  arts: ArtifactsBySlot
  artsVec: ArtifactsBySlotVec

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
export interface Iterate {
  command: "iterate"
  threshold: number

  subproblem: SubProblem
}
export interface Finalize {
  command: "finalize"
}
export interface Share {
  command: "share"
  sender: number
}
export interface Count {
  command: "count"
  arts: ArtifactsBySlot[]
  exclusion: ArtSetExclusion
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
export interface ShareResult {
  command: "share"
  subproblem?: SubProblem
  sender: number
}
export interface CountResult {
  command: "count"
  counts: number[]
}
