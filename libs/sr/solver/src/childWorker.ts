import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { compile } from '@genshin-optimizer/pando/engine'
import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import { MAX_BUILDS } from './common'
import type { LightConeStats, RelicStats } from './parentWorker'
import type { BuildResult } from './solver'

const MAX_BUILDS_TO_SEND = 200_000
let compiledCalcFunction: (relicStats: RelicStats['stats'][]) => number[]
let lightConeStats: LightConeStats[]
let relicStatsBySlot: Record<RelicSlotKey, RelicStats[]>
let constraints: Array<{ value: number; isMax: boolean }> = []

export interface ChildCommandInit {
  command: 'init'
  lightConeStats: LightConeStats[]
  relicStatsBySlot: Record<RelicSlotKey, RelicStats[]>
  constraints: Array<{ value: number; isMax: boolean }>
  detachedNodes: NumTagFree[]
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
  numBuildsComputed: number
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
    console.error(err)
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
  lightConeStats: lcs,
  relicStatsBySlot: relics,
  detachedNodes: combinedNodes,
  constraints: initCons,
}: ChildCommandInit) {
  // Step 4: Compile for quick iteration
  compiledCalcFunction = compile(
    combinedNodes,
    'q', // Tag category for object key
    7, // Number of slots
    {} // Initial values
    // Header; includes custom formulas, such as `res`
  )
  lightConeStats = lcs
  relicStatsBySlot = relics
  constraints = initCons

  // Let parent know we are ready to optimize
  postMessage({ resultType: 'initialized' })
}
function* generateCombinations(): Generator<{
  lightCone: LightConeStats
  head: RelicStats
  hands: RelicStats
  feet: RelicStats
  body: RelicStats
  sphere: RelicStats
  rope: RelicStats
}> {
  for (const lightCone of lightConeStats) {
    for (const head of relicStatsBySlot.head) {
      for (const hands of relicStatsBySlot.hands) {
        for (const feet of relicStatsBySlot.feet) {
          for (const body of relicStatsBySlot.body) {
            for (const sphere of relicStatsBySlot.sphere) {
              for (const rope of relicStatsBySlot.rope) {
                yield {
                  lightCone,
                  head,
                  hands,
                  feet,
                  body,
                  sphere,
                  rope,
                }
              }
            }
          }
        }
      }
    }
  }
}
// Actually start calculating builds and sending back periodic responses
async function start() {
  let builds: BuildResult[] = []
  let skipped = 0

  function sliceSortSendBuilds() {
    const numBuildsComputed = builds.length
    if (builds.length > MAX_BUILDS) {
      builds.sort((a, b) => b.value - a.value)
      builds = builds.slice(0, MAX_BUILDS)
    }
    postMessage({
      resultType: 'results',
      builds,
      numBuildsComputed: numBuildsComputed + skipped,
    })
    builds = []
    skipped = 0
  }
  for (const {
    lightCone,
    head,
    hands,
    feet,
    body,
    sphere,
    rope,
  } of generateCombinations()) {
    // Step 5: Calculate the value
    const results = compiledCalcFunction([
      lightCone.stats,
      head.stats,
      hands.stats,
      feet.stats,
      body.stats,
      sphere.stats,
      rope.stats,
    ])
    if (
      constraints.every(({ value, isMax }, i) =>
        isMax ? results[i + 1] <= value : results[i + 1] >= value
      )
    ) {
      builds.push({
        value: results[0], // We only pass 1 target to calculate, so just grab the 1st result
        lightConeId: lightCone.id,
        relicIds: {
          head: head.id,
          hands: hands.id,
          feet: feet.id,
          body: body.id,
          sphere: sphere.id,
          rope: rope.id,
        },
      })
    } else {
      skipped++
    }
    if (builds.length > MAX_BUILDS_TO_SEND) {
      sliceSortSendBuilds()
    }
  }

  if (builds.length > 0) {
    sliceSortSendBuilds()
  }

  postMessage({
    resultType: 'done',
  })
}
