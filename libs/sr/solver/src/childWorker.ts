import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { compile } from '@genshin-optimizer/pando/engine'
import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import type { BuildResultByIndex, EquipmentStats } from './common'
import { MAX_BUILDS } from './common'

const MAX_BUILDS_TO_SEND = 200_000
let compiledCalcFunction: (equipmentStatsOnly: EquipmentStats[]) => number[]
let lightConeStats: EquipmentStats[]
let relicStatsBySlot: Record<RelicSlotKey, EquipmentStats[]>
let constraints: number[] = []

export interface ChildCommandInit {
  command: 'init'
  lightConeStats: EquipmentStats[]
  relicStatsBySlot: Record<RelicSlotKey, EquipmentStats[]>
  constraints: number[]
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
  builds: BuildResultByIndex[]
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
  lightCone: EquipmentStats
  head: EquipmentStats
  hands: EquipmentStats
  feet: EquipmentStats
  body: EquipmentStats
  sphere: EquipmentStats
  rope: EquipmentStats
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
  let builds: BuildResultByIndex[] = []
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
      lightCone,
      head,
      hands,
      feet,
      body,
      sphere,
      rope,
    ])
    if (constraints.every((value, i) => results[i] >= value)) {
      builds.push({
        value: results[results.length - 1], // We only pass 1 target to calculate, as the final entry
        lightConeIndex: lightCone.id,
        relicIndices: {
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
