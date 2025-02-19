import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { combineConst, flatten } from '@genshin-optimizer/pando/engine'
import {
  allRelicSlotKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import type { ChildCommandInit, ChildMessage } from './childWorker'
import type { EquipmentStats } from './common'
import { MAX_BUILDS } from './common'
import type { BuildResult, ProgressResult } from './solver'

let workers: Worker[]

export interface ParentCommandStart {
  command: 'start'
  lightConeStats: EquipmentStats[]
  relicStatsBySlot: Record<RelicSlotKey, EquipmentStats[]>
  detachedNodes: NumTagFree[]
  constraints: Array<{ value: number; isMax: boolean }>
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
  buildResults: BuildResult[]
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

// Receiving a message from main thread to worker
onmessage = async (e: MessageEvent<ParentCommand>) => {
  try {
    await handleEvent(e)
  } catch (err) {
    console.error(err)
    postMessage({ resultType: 'err', message: JSON.stringify(err) })
  }
}

async function handleEvent(e: MessageEvent<ParentCommand>): Promise<void> {
  const { data } = e,
    { command } = data
  switch (command) {
    case 'start':
      await start(data)
      break
    case 'terminate':
      terminate()
      break
  }
}

async function start({
  lightConeStats,
  relicStatsBySlot,
  detachedNodes,
  constraints,
  numWorkers,
}: ParentCommandStart) {
  // Step 3: Optimize nodes, as needed
  detachedNodes = flatten(detachedNodes)
  detachedNodes = combineConst(detachedNodes)

  // Split work on the largest slot to reduce variance in work between workers
  const { largestSlot } = Object.entries(relicStatsBySlot).reduce(
    ({ largestSlot, largestSize }, [currentSlot, relics]) =>
      relics.length > largestSize
        ? {
            largestSlot: currentSlot as RelicSlotKey,
            largestSize: relics.length,
          }
        : { largestSlot, largestSize },
    { largestSlot: 'head' as RelicSlotKey, largestSize: -1 }
  )
  // Split work
  const chunkedRelicStatsBySlot: Record<RelicSlotKey, EquipmentStats[]>[] =
    range(0, numWorkers - 1).map((worker) =>
      objKeyMap(allRelicSlotKeys, (slot) =>
        slot === largestSlot
          ? // For largest slot, only give ~1/numWorkers amount of relics
            relicStatsBySlot[slot].filter(
              (_, index) => index % numWorkers === worker
            )
          : // For other slots, give all relics
            relicStatsBySlot[slot]
      )
    )

  // Spawn child workers to calculate builds
  workers = range(1, numWorkers).map(
    () =>
      new Worker(new URL('./childWorker.ts', import.meta.url), {
        type: 'module',
      })
  )

  let results: BuildResult[] = []
  let numBuildsComputed = 0

  // post initial progress
  postMessage({
    resultType: 'progress',
    progress: {
      numBuildsKept: 0,
      numBuildsComputed: 0,
    },
  })
  // Wait for all workers to finish optimizing
  await Promise.all(
    workers.map((worker, index) => {
      return new Promise<void>((res, rej) => {
        // On worker completion, resolve promise
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
              // TODO: Send message to child workers with the lowest build so far.
              // Then, children can automatically filter out any builds less than that.
              break
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
          lightConeStats,
          relicStatsBySlot: chunkedRelicStatsBySlot[index],
          detachedNodes,
          constraints,
        }
        worker.postMessage(message)
      })
    })
  )

  // Send back results, which can take a few seconds
  postMessage({
    resultType: 'done',
    buildResults: results.sort((a, b) => b.value - a.value).slice(0, 10), // TODO: take numBuilds from opt UI
  })
}

function terminate() {
  workers.forEach((w) => w.terminate())
  postMessage({
    resultType: 'terminated',
  })
}
