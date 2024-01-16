import type { NumTagFree } from '@genshin-optimizer/pando'
import { compile } from '@genshin-optimizer/pando'
import { type RelicSlotKey } from '@genshin-optimizer/sr-consts'
import type { BuildResult } from './optimize'
import type { RelicStats } from './parentWorker'

const MAX_BUILDS_TO_SEND = 100_000
let compiledCalcFunction: (relicStats: RelicStats['stats'][]) => number[]
let relicStatsBySlot: Record<RelicSlotKey, RelicStats[]>

export interface ChildCommandInit {
  command: 'init'
  relicStatsBySlot: Record<RelicSlotKey, RelicStats[]>
  combinedNodes: NumTagFree[]
}
export interface ChildCommandStart {
  command: 'start'
}
export type ChildCommand = ChildCommandInit | ChildCommandStart

export interface ChildMessageInitialized {
  resultType: 'initialized'
}
export interface ChildMessaageResults {
  resultType: 'results'
  builds: BuildResult[]
}
export interface ChildMessageDone {
  resultType: 'done'
}
export interface ChildMessageErr {
  resultType: 'err'
  message: string
}
export type ChildMessage =
  | ChildMessageInitialized
  | ChildMessaageResults
  | ChildMessageDone
  | ChildMessageErr

// Get proper typings for posting a message back to parent worker
declare function postMessage(message: ChildMessage): void

// Receiving a message from parent worker to child worker
onmessage = async (e: MessageEvent<ChildCommand>) => {
  try {
    await handleEvent(e)
  } catch (err) {
    console.log(err)
    postMessage({ resultType: 'err', message: JSON.stringify(err) })
  }
}

// Handle messages from parent worker to child worker
async function handleEvent(e: MessageEvent<ChildCommand>): Promise<void> {
  const { data } = e,
    { command } = data
  switch (command) {
    case 'init':
      init(data)
      break
    case 'start':
      await start()
      break
  }
}

// Create compiledCalcFunction
async function init({
  relicStatsBySlot: relics,
  combinedNodes,
}: ChildCommandInit) {
  // Step 4: Compile for quick iteration
  compiledCalcFunction = compile(
    combinedNodes,
    'q', // Tag category for object key
    6, // Number of slots
    {} // Initial values
    // Header; includes custom formulas, such as `res`
  )
  relicStatsBySlot = relics

  // Let parent know we are ready to optimize
  postMessage({ resultType: 'initialized' })
}

// Actually start calculating builds and sending back periodic responses
async function start() {
  let buildResults: BuildResult[] = []
  relicStatsBySlot.head.forEach((head) => {
    relicStatsBySlot.hand.forEach((hand) => {
      relicStatsBySlot.feet.forEach((feet) => {
        relicStatsBySlot.body.forEach((body) => {
          relicStatsBySlot.sphere.forEach((sphere) => {
            relicStatsBySlot.rope.forEach((rope) => {
              // Step 5: Calculate the value
              const results = compiledCalcFunction([
                head.stats,
                hand.stats,
                feet.stats,
                body.stats,
                sphere.stats,
                rope.stats,
              ])

              buildResults.push({
                value: results[0], // We only pass 1 target to calculate, so just grab the 1st result
                ids: {
                  head: head.id,
                  hand: hand.id,
                  feet: feet.id,
                  body: body.id,
                  sphere: sphere.id,
                  rope: rope.id,
                },
              })
              if (buildResults.length > MAX_BUILDS_TO_SEND) {
                postMessage({
                  resultType: 'results',
                  builds: buildResults,
                })
                buildResults = []
              }
            })
          })
        })
      })
    })
  })

  if (buildResults.length > 0) {
    postMessage({
      resultType: 'results',
      builds: buildResults,
    })
  }

  postMessage({
    resultType: 'done',
  })
}
