import { range } from '@genshin-optimizer/common/util'
import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { combineConst, flatten } from '@genshin-optimizer/pando/engine'
import type { ChildCommandInit, ChildMessage } from './childWorker'
import type {
  BuildResultByIndex,
  EquipmentStats,
  ProgressResult,
} from './common'
import { MAX_BUILDS } from './common'

export interface ParentCommandStart {
  command: 'start'
  equipmentStats: EquipmentStats[][]
  detachedNodes: NumTagFree[]
  constraints: number[]
  numWorkers: number
}
export interface ParentCommandTerminate {
  command: 'terminate'
}
export type ParentCommand = ParentCommandStart | ParentCommandTerminate

export interface ParentMessageProgress {
  resultType: 'progress'
  progress: ProgressResult
}
export interface ParentMessageSending {
  resultType: 'sending'
}
export interface ParentMessageDone {
  resultType: 'done'
  buildResults: BuildResultByIndex[]
}
export interface ParentMessageTerminated {
  resultType: 'terminated'
}
export interface ParentMessageErr {
  resultType: 'err'
  message: string
}
export type ParentMessage =
  | ParentMessageProgress
  | ParentMessageDone
  | ParentMessageTerminated
  | ParentMessageErr

// Get proper typings for posting a message back to main thread
declare function postMessage(message: ParentMessage): void

export class ParentWorker {
  workers: Worker[] = []
  spawnWorker: () => Worker

  constructor(spawnWorker: () => Worker) {
    this.spawnWorker = spawnWorker
  }

  async handleEvent(e: MessageEvent<ParentCommand>): Promise<void> {
    const { data } = e,
      { command } = data
    switch (command) {
      case 'start':
        await this.start(data)
        break
      case 'terminate':
        this.terminate()
        break
    }
  }

  async start({
    equipmentStats,
    detachedNodes,
    constraints,
    numWorkers,
  }: ParentCommandStart) {
    // Step 3: Optimize nodes, as needed
    detachedNodes = flatten(detachedNodes)
    detachedNodes = combineConst(detachedNodes)

    const chunkedStatsBySlot = this.splitWork(equipmentStats, numWorkers)

    // Spawn child workers to calculate builds
    this.workers = range(1, numWorkers).map(this.spawnWorker)

    // post initial progress
    postMessage({
      resultType: 'progress',
      progress: {
        numBuildsKept: 0,
        numBuildsComputed: 0,
      },
    })

    // Wait for all workers to finish optimizing
    const results = await this.handleAllWorkers(
      chunkedStatsBySlot,
      detachedNodes,
      constraints
    )

    // Send back results
    postMessage({
      resultType: 'done',
      buildResults: results.sort((a, b) => b.value - a.value).slice(0, 10), // TODO: take numBuilds from opt UI
    })
  }

  terminate() {
    this.workers.forEach((w) => w.terminate())
    postMessage({
      resultType: 'terminated',
    })
  }

  private splitWork(equipmentStats: EquipmentStats[][], numWorkers: number) {
    // Split work on the largest slot to reduce variance in work between workers
    const { largestSlot } = equipmentStats.reduce(
      ({ largestSlot, largestSize }, equips, currentSlot) =>
        equips.length > largestSize
          ? {
              largestSlot: currentSlot,
              largestSize: equips.length,
            }
          : { largestSlot, largestSize },
      { largestSlot: -1, largestSize: -1 }
    )
    // Split work
    const chunkedStatsBySlot: EquipmentStats[][][] = range(
      0,
      numWorkers - 1
    ).map((worker) =>
      equipmentStats.map((_, slot) =>
        slot === largestSlot
          ? // For largest slot, only give ~1/numWorkers amount of relics
            equipmentStats[slot].filter(
              (_, index) => index % numWorkers === worker
            )
          : // For other slots, give all relics
            equipmentStats[slot]
      )
    )
    return chunkedStatsBySlot
  }

  private async handleAllWorkers(
    chunkedStatsBySlot: EquipmentStats[][][],
    detachedNodes: NumTagFree[],
    constraints: number[]
  ) {
    let results: BuildResultByIndex[] = []
    let numBuildsComputed = 0

    function startAndHandleWorker(worker: Worker, index: number) {
      return new Promise<void>((res, rej) => {
        worker.onmessage = ({ data }: MessageEvent<ChildMessage>) => {
          switch (data.resultType) {
            case 'initialized':
              // Worker is initialized; start optimizing
              worker.postMessage({ command: 'start' })
              break
            case 'results':
              numBuildsComputed += data.numBuildsComputed
              results = results.concat(data.builds)
              // Only sort and slice occasionally
              if (results.length > MAX_BUILDS * 4) {
                results.sort((a, b) => b.value - a.value)
                results = results.slice(0, MAX_BUILDS)
              }
              postMessage({
                resultType: 'progress',
                progress: {
                  numBuildsKept: Math.min(results.length, MAX_BUILDS),
                  numBuildsComputed,
                },
              })
              break
            // On worker completion, resolve promise
            case 'done':
              res()
              break
            case 'err':
              console.error(data)
              rej()
              break
          }
        }

        // Initialize worker
        const message: ChildCommandInit = {
          command: 'init',
          equipmentStats: chunkedStatsBySlot[index],
          detachedNodes,
          constraints,
        }
        worker.postMessage(message)
      })
    }

    await Promise.all(this.workers.map(startAndHandleWorker))

    return results
  }
}
