import type {
  DiscSetKey,
  DiscSlotKey,
  FormulaKey,
} from '@genshin-optimizer/zzz/consts'
import type { Constraints, Stats } from '@genshin-optimizer/zzz/db'
import { applyCalc, calcFormula, passSetFilter } from './calc'
import type { BuildResult, DiscStats } from './common'
import { MAX_BUILDS } from './common'

const MAX_BUILDS_TO_SEND = 200_000
let discStatsBySlot: Record<DiscSlotKey, DiscStats[]>
let constraints: Constraints
let baseStats: Stats
let formulaKey: FormulaKey
let setFilter2p: DiscSetKey[]
let setFilter4p: DiscSetKey[]

export interface ChildCommandInit {
  command: 'init'
  baseStats: Stats
  discStatsBySlot: Record<DiscSlotKey, DiscStats[]>
  constraints: Constraints
  formulaKey: FormulaKey
  setFilter2: DiscSetKey[] // [] means rainbow
  setFilter4: DiscSetKey[] // [] means rainbow
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
  baseStats: bs,
  discStatsBySlot: discs,
  constraints: initCons,
  formulaKey: fk,
  setFilter2,
  setFilter4,
}: ChildCommandInit) {
  baseStats = bs
  discStatsBySlot = discs
  constraints = initCons
  formulaKey = fk
  setFilter2p = setFilter2
  setFilter4p = setFilter4

  // Let parent know we are ready to optimize
  postMessage({ resultType: 'initialized' })
}
function* generateCombinations(): Generator<{
  d1: DiscStats
  d2: DiscStats
  d3: DiscStats
  d4: DiscStats
  d5: DiscStats
  d6: DiscStats
}> {
  for (const d1 of discStatsBySlot['1']) {
    for (const d2 of discStatsBySlot['2']) {
      for (const d3 of discStatsBySlot['3']) {
        for (const d4 of discStatsBySlot['4']) {
          for (const d5 of discStatsBySlot['5']) {
            for (const d6 of discStatsBySlot['6']) {
              yield {
                d1,
                d2,
                d3,
                d4,
                d5,
                d6,
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
  const constraintArr = Object.entries(constraints)
  for (const { d1, d2, d3, d4, d5, d6 } of generateCombinations()) {
    /**
     * Calculation takes several steps:
     * 1. `passSetFilter()` filtering 2/4p effects
     * 2. `applyCalc()` sum up stats from base + discs + 2p effects
     * 3. filter using constraints
     * 4. `calcFormula()` calculate final value of target
     * 5. return build with calculated value.
     */

    const discs = [d1, d2, d3, d4, d5, d6]
    // 1. Filter using set filter
    if (!passSetFilter(discs, setFilter2p, setFilter4p)) {
      // Skip early due to failing set filter
      skipped++
      continue
    }
    // 2. Calculate base stats.
    const sum = applyCalc(baseStats, discs)
    // 3Filter using constraints
    if (
      constraintArr.every(([k, { value, isMax }]) =>
        isMax ? sum[k] <= value : sum[k] >= value
      )
    ) {
      builds.push({
        // 4. Calculate final value
        value: calcFormula(sum, formulaKey),
        discIds: {
          1: d1.id,
          2: d2.id,
          3: d3.id,
          4: d4.id,
          5: d5.id,
          6: d6.id,
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
