import type {
  CondKey,
  DiscSetKey,
  DiscSlotKey,
  FormulaKey,
} from '@genshin-optimizer/zzz/consts'
import type { Constraints, ICachedDisc, Stats } from '@genshin-optimizer/zzz/db'
import type { BuildResult } from './common'
import type {
  ParentCommandStart,
  ParentCommandTerminate,
  ParentMessage,
} from './parentWorker'

export interface ProgressResult {
  numBuildsKept: number
  numBuildsComputed: number
}

export class Solver {
  private baseStats: Stats
  private conditionals: Partial<Record<CondKey, number>>
  private constraints: Constraints
  private discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  private formulaKey: FormulaKey
  private numWorkers: number
  private setProgress: (progress: ProgressResult) => void
  private worker: Worker
  private setFilter2: DiscSetKey[] // [] means rainbow
  private setFilter4: DiscSetKey[] // [] means rainbow

  constructor(
    formulaKey: FormulaKey,
    baseStats: Stats,
    conditionals: Partial<Record<CondKey, number>>,
    constraints: Constraints,
    setFilter2: DiscSetKey[], // [] means rainbow
    setFilter4: DiscSetKey[], // [] means rainbow
    discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
    numWorkers: number,
    setProgress: (progress: ProgressResult) => void,
  ) {
    this.formulaKey = formulaKey
    this.baseStats = baseStats
    this.conditionals = conditionals
    this.constraints = constraints
    this.discsBySlot = discsBySlot
    this.numWorkers = numWorkers
    this.setProgress = setProgress
    this.setFilter2 = setFilter2
    this.setFilter4 = setFilter4

    // Spawn a parent worker to compile nodes, split/filter discs and spawn child workers for calculating results
    this.worker = new Worker(new URL('./parentWorker.ts', import.meta.url), {
      type: 'module',
    })
  }

  async optimize() {
    // Wait for parent worker to report complete
    const buildResults = await new Promise<BuildResult[]>((res, rej) => {
      this.worker.onmessage = ({ data }: MessageEvent<ParentMessage>) => {
        switch (data.resultType) {
          case 'progress':
            this.setProgress(data.progress)
            break
          case 'done':
            res(data.buildResults)
            break
          case 'err':
            console.error(data)
            rej()
            break
        }
      }

      // Start worker
      const message: ParentCommandStart = {
        baseStats: this.baseStats,
        conditionals: this.conditionals,
        command: 'start',
        discsBySlot: this.discsBySlot,
        constraints: this.constraints,
        numWorkers: this.numWorkers,
        formulaKey: this.formulaKey,
        setFilter2: this.setFilter2,
        setFilter4: this.setFilter4,
      }
      this.worker.postMessage(message)
    })

    return buildResults
  }

  async terminate() {
    const message: ParentCommandTerminate = {
      command: 'terminate',
    }
    this.worker.postMessage(message)
    // Wait for child workers to finish terminating
    await new Promise<void>((res, rej) => {
      this.worker.onmessage = ({ data }: MessageEvent<ParentMessage>) => {
        switch (data.resultType) {
          case 'terminated':
            res()
            break
          case 'err':
            console.error(data)
            rej()
            break
        }
      }
    })

    this.worker.terminate()
  }
}
