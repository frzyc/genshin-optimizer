import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { FormulaKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSlotKeys,
  type DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import type { Constraints, ICachedDisc, Stats } from '@genshin-optimizer/zzz/db'
import type { ChildCommandInit, ChildMessage } from './childWorker'
import type { BuildResult, DiscStats } from './common'
import { convertDiscToStats, MAX_BUILDS } from './common'
import type { ProgressResult } from './solver'

let workers: Worker[]

export interface ParentCommandStart {
  command: 'start'
  baseStats: Stats
  constraints: Constraints
  // lightCones: ICachedLightCone[]
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  // detachedNodes: NumTagFree[]
  formulaKey: FormulaKey
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
  baseStats,
  discsBySlot,
  constraints,
  numWorkers,
  formulaKey,
}: ParentCommandStart) {
  const discStatsBySlot = objKeyMap(allDiscSlotKeys, (slot) =>
    discsBySlot[slot].map(convertDiscToStats)
  )

  // Split work on the largest slot to reduce variance in work between workers
  const { largestSlot } = Object.entries(discsBySlot).reduce(
    ({ largestSlot, largestSize }, [currentSlot, discs]) =>
      discs.length > largestSize
        ? {
            largestSlot: currentSlot as DiscSlotKey,
            largestSize: discs.length,
          }
        : { largestSlot, largestSize },
    { largestSlot: 'head' as DiscSlotKey, largestSize: -1 }
  )
  // Split work
  const chunkedDiscStatsBySlot: Record<DiscSlotKey, DiscStats[]>[] = range(
    0,
    numWorkers - 1
  ).map((worker) =>
    objKeyMap(allDiscSlotKeys, (slot) =>
      slot === largestSlot
        ? // For largest slot, only give ~1/numWorkers amount of discs
          discStatsBySlot[slot].filter(
            (_, index) => index % numWorkers === worker
          )
        : // For other slots, give all discs
          discStatsBySlot[slot]
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
          baseStats,
          discStatsBySlot: chunkedDiscStatsBySlot[index],
          constraints,
          formulaKey,
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
