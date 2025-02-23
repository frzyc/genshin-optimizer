import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { compile } from '@genshin-optimizer/pando/engine'
import type { BuildResultByIndex, EquipmentStats } from './common'
import { MAX_BUILDS } from './common'

const MAX_BUILDS_TO_SEND = 200_000
let compiledCalcFunction: (equipmentStatsOnly: EquipmentStats[]) => number[]
let equipmentStats: EquipmentStats[][]
let constraints: number[] = []

export interface ChildCommandInit {
  command: 'init'
  equipmentStats: EquipmentStats[][]
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
  equipmentStats: ecs,
  detachedNodes: combinedNodes,
  constraints: initCons,
}: ChildCommandInit) {
  // Step 4: Compile for quick iteration
  compiledCalcFunction = compile(
    combinedNodes,
    'q', // Tag category for object key
    Object.keys(ecs).length, // Number of slots
    {} // Initial values
    // Header; includes custom formulas, such as `res`
  )
  equipmentStats = ecs
  constraints = initCons

  // Let parent know we are ready to optimize
  postMessage({ resultType: 'initialized' })
}

// ???
// Recursively generate cartesian product of an array of arrays
function* generateCombinations(
  head: EquipmentStats[],
  ...tail: EquipmentStats[][]
): Generator<EquipmentStats[]> {
  const [h, ...t] = tail
  const remainder = tail.length > 0 ? generateCombinations(h, ...t) : [[]]
  for (const r of remainder) for (const h of head) yield [h, ...r]
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
  const [head, ...tail] = equipmentStats
  for (const stats of generateCombinations(head, ...tail)) {
    // Step 5: Calculate the value
    const results = compiledCalcFunction(stats)
    // Constraints are offset by 1 because the opt target is first
    if (constraints.every((value, i) => results[i + 1] >= value)) {
      builds.push({
        value: results[0], // We only pass 1 target to calculate, as the first entry
        indices: stats.map((s) => s.id),
      })
    } else {
      skipped++
    }
    if (builds.length + skipped > MAX_BUILDS_TO_SEND) {
      sliceSortSendBuilds()
    }
  }

  if (builds.length + skipped > 0) {
    sliceSortSendBuilds()
  }

  postMessage({
    resultType: 'done',
  })
}
