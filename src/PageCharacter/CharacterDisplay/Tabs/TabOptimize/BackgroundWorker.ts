import { assertUnreachable } from '../../../../Util/Util'
import { Build, PlotData, RequestFilter } from "./common"
import { ComputeWorker } from "./ComputeWorker"
import { Setup, SplitWorker } from "./SplitWorker"

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
    default: assertUnreachable(command)
  }
  postMessage({ id, ...result });
}

export type WorkerCommand = Setup | Split | Iterate | Finalize
export type WorkerResult = InterimResult | SplitResult | IterateResult | FinalizeResult

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

export interface SplitResult {
  command: "split"
  filter: RequestFilter | undefined
}
export interface FinalizeResult {
  command: "finalize"
  builds: Build[]
  plotData?: PlotData
}
export interface IterateResult {
  command: "iterate"
}
export interface InterimResult {
  command: "interim"
  buildValues: number[] | undefined
  /** The number of builds since last report, including failed builds */
  buildCount: number
  /** The number of builds that does not meet the min-filter requirement since last report */
  failedCount: number
  skippedCount: number
}
