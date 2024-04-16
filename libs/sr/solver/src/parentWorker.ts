import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { combineConst, flatten } from '@genshin-optimizer/pando/engine'
import {
  allRelicSlotKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import type { ICachedRelic } from '@genshin-optimizer/sr/db'
import { getRelicMainStatVal } from '@genshin-optimizer/sr/util'
import type { ChildCommand, ChildMessage } from './childWorker'
import { MAX_BUILDS } from './common'
import type { BuildResult, ProgressResult } from './solver'

let workers: Worker[]

export interface ParentCommandStart {
  command: 'start'
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  detachedNodes: NumTagFree[]
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

export type RelicStats = {
  id: string
  stats: Record<string, number>
}

// Get proper typings for posting a message back to main thread
declare function postMessage(message: ParentMessage): void

// Receiving a message from main thread to worker
onmessage = async (e: MessageEvent<ParentCommand>) => {
  try {
    await handleEvent(e)
  } catch (err) {
    console.log(err)
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
  relicsBySlot,
  detachedNodes,
  numWorkers,
}: ParentCommandStart) {
  // Step 3: Optimize nodes, as needed
  detachedNodes = flatten(detachedNodes)
  detachedNodes = combineConst(detachedNodes)

  const relicStatsBySlot = objKeyMap(allRelicSlotKeys, (slot) =>
    relicsBySlot[slot].map(convertRelicToStats)
  )

  const chunkSize = Math.floor(relicsBySlot.head.length / numWorkers)
  // Spawn child workers to calculate builds
  workers = range(1, numWorkers).map(
    () =>
      new Worker(new URL('./childWorker.ts', import.meta.url), {
        type: 'module',
      })
  )
  // Wait for all workers to finish optimizing
  let results: BuildResult[] = []
  let numBuildsComputed = 0
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
              console.log(data)
              rej()
              break
          }
        }

        // Chunk data
        const chunkedRelicsBySlot: Record<RelicSlotKey, RelicStats[]> = {
          ...relicStatsBySlot,
          head: relicStatsBySlot.head.slice(
            index * chunkSize,
            index === numWorkers - 1
              ? undefined // Last chunk may be slightly larger to accomodate remainder from chunking
              : (index + 1) * chunkSize
          ),
        }
        // Initialize worker
        const message: ChildCommand = {
          command: 'init',
          relicStatsBySlot: chunkedRelicsBySlot,
          detachedNodes,
        }
        worker.postMessage(message)
      })
    })
  )

  // Trigger spinner on UI
  if (results.length > MAX_BUILDS) {
    results.sort((a, b) => b.value - a.value)
    results = results.slice(0, MAX_BUILDS)
  }
  // Send back results, which can take a few seconds
  postMessage({
    resultType: 'done',
    buildResults: results,
  })
}

function terminate() {
  workers.forEach((w) => w.terminate())
  postMessage({
    resultType: 'terminated',
  })
}

function convertRelicToStats(relic: ICachedRelic): RelicStats {
  return {
    id: relic.id,
    stats: {
      [relic.mainStatKey]: getRelicMainStatVal(
        relic.rarity,
        relic.mainStatKey,
        relic.level
      ),
      ...Object.fromEntries(
        relic.substats.map((substat) => [substat.key, substat.value])
      ),
      [relic.setKey]: 1,
    },
  }
}
