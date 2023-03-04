import { WorkerCommand, WorkerResult } from '..'
import { assertUnreachable } from '../../Util/Util'
import { artSetPerm, countBuilds, filterArts, filterFeasiblePerm, RequestFilter } from "../common"
import { BNBSplitWorker } from "./BNBSplitWorker"
import { ComputeWorker } from "./ComputeWorker"
import { DefaultSplitWorker } from './DefaultSplitWorker'

declare function postMessage(command: WorkerCommand | WorkerResult): void

let splitWorker: SplitWorker, computeWorker: ComputeWorker

onmessage = async (e: MessageEvent<WorkerCommand>) => {
  const { data } = e, { command } = data
  switch (command) {
    case "split":
      for (const filter of splitWorker.split(data.filter, data.maxIterateSize)) {
        postMessage({ command: 'iterate', filter })
        await Promise.resolve() // in case a `threshold` is sent over
      }
      break
    case "iterate":
      computeWorker.compute(data.filter)
      break
    case "threshold": {
      splitWorker.setThreshold(data.threshold)
      computeWorker.setThreshold(data.threshold)
      return // This is a fire-and-forget command
    }
    case "finalize": {
      computeWorker.refresh(true)
      const { builds, plotData } = computeWorker
      postMessage({ resultType: 'finalize', builds, plotData })
      break
    }
    case "count": {
      const { exclusion, maxIterateSize } = data, arts = computeWorker.arts
      const perms = filterFeasiblePerm(artSetPerm(exclusion, [...new Set(Object.values(arts.values).flatMap(x => x.map(x => x.set!)))]), arts)
      let count = 0
      for (const filter of perms) {
        postMessage({ command: 'split', filter, maxIterateSize })
        count += countBuilds(filterArts(arts, filter))
      }
      postMessage({ resultType: "count", count })
      break
    }
    case "setup":
      try {
        splitWorker = new BNBSplitWorker(data, x => postMessage(x))
      } catch {
        splitWorker = new DefaultSplitWorker(data, x => postMessage(x))
      }
      computeWorker = new ComputeWorker(data, x => postMessage(x))
      break
    default: assertUnreachable(command)
  }
  postMessage({ resultType: 'done' })
}

export interface SplitWorker {
  split(filter: RequestFilter, minCount: number): Iterable<RequestFilter>
  setThreshold(newThreshold: number): void
}
