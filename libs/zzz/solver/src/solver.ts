import type { DiscSlotKey, FormulaKey } from '@genshin-optimizer/zzz/consts'
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
  private constraints: Constraints
  private discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  private formulaKey: FormulaKey
  private numWorkers: number
  private setProgress: (progress: ProgressResult) => void
  private worker: Worker

  constructor(
    formulaKey: FormulaKey,
    baseStats: Stats,
    constraints: Constraints,
    discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
    numWorkers: number,
    setProgress: (progress: ProgressResult) => void
  ) {
    this.formulaKey = formulaKey
    this.baseStats = baseStats
    this.constraints = constraints
    this.discsBySlot = discsBySlot
    this.numWorkers = numWorkers
    this.setProgress = setProgress

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
        command: 'start',
        // lightCones: this.lightCones,
        discsBySlot: this.discsBySlot,
        // detachedNodes: this.detachNodes(),
        constraints: this.constraints,
        numWorkers: this.numWorkers,
        formulaKey: this.formulaKey,
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
