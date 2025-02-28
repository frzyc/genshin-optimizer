import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import { compile } from '@genshin-optimizer/pando/engine'
import type { BuildResult, EquipmentStats } from './common'
import { MAX_BUILDS } from './common'

const MAX_BUILDS_TO_SEND = 200_000

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
export interface ChildMessageResults {
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
  | ChildMessageResults
  | ChildMessageDone
  | ChildMessageErr

// Get proper typings for posting a message back to parent worker
declare function postMessage(message: ChildMessage): void

export class ChildWorker {
  compiledCalcFunction: (equipmentStatsOnly: EquipmentStats[]) => number[] =
    () => []
  equipmentStats: EquipmentStats[][] = []
  constraints: number[] = []

  // Handle messages from parent worker to child worker
  async handleEvent(e: MessageEvent<ChildCommand>): Promise<void> {
    const { data } = e,
      { command } = data
    switch (command) {
      case 'init':
        this.init(data)
        break
      case 'start':
        await this.start()
        break
    }
  }

  // Create compiledCalcFunction
  async init({
    equipmentStats: eqs,
    detachedNodes: combinedNodes,
    constraints: initCons,
  }: ChildCommandInit) {
    // Step 4: Compile for quick iteration
    this.compiledCalcFunction = compile(
      combinedNodes,
      'q', // Tag category for object key
      eqs.length, // Number of slots
      {} // Initial values
      // Header; includes custom formulas, such as `res`
    )
    this.equipmentStats = eqs
    this.constraints = initCons

    // Let parent know we are ready to optimize
    postMessage({ resultType: 'initialized' })
  }

  // ???
  // Recursively generate cartesian product of an array of arrays
  *generateCombinations(
    head: EquipmentStats[],
    ...tail: EquipmentStats[][]
  ): Generator<EquipmentStats[]> {
    const [h, ...t] = tail
    const remainder =
      tail.length > 0 ? this.generateCombinations(h, ...t) : [[]]
    for (const r of remainder) for (const h of head) yield [h, ...r]
  }
  // Actually start calculating builds and sending back periodic responses
  async start() {
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
    const [head, ...tail] = this.equipmentStats
    for (const stats of this.generateCombinations(head, ...tail)) {
      // Step 5: Calculate the value
      const results = this.compiledCalcFunction(stats)
      if (this.constraints.every((value, i) => results[i] >= value)) {
        // We only pass opt target, which is the first entry
        builds.push({ value: results[0], ids: stats.map((s) => s.id) })
      } else skipped++
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
}
