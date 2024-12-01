import { optimize } from '@genshin-optimizer/gi/wr'
import { pruneAll, pruneExclusion } from '../common'
import { WorkerCoordinator } from '../coordinator'
import type {
  Count,
  FinalizeResult,
  Interim,
  OptProblemInput,
  Setup,
  WorkerCommand,
  WorkerResult,
} from '../type'

export class GOSolver extends WorkerCoordinator<WorkerCommand, WorkerResult> {
  private maxIterateSize = 32_000_000
  private status: Record<'tested' | 'failed' | 'skipped' | 'total' | 'testedPerSecond' | 'skippedPerSecond', number>
  private exclusion: Count['exclusion']
  private topN: number
  private buildValues: { w: Worker; val: number }[]
  private finalizedResults: FinalizeResult[] = []

  constructor(
    problem: OptProblemInput,
    status: GOSolver['status'],
    numWorker: number
  ) {
    const workers = Array(numWorker)
      .fill(NaN)
      .map(
        (_) =>
          new Worker(new URL('./BackgroundWorker.ts', import.meta.url), {
            type: 'module',
          })
      )
    super(workers, ['iterate', 'split', 'count'], (r, w) => {
      switch (r.resultType) {
        case 'interim':
          this.interim(r, w)
          break
        case 'finalize':
          this.finalizedResults.push(r)
          break
        case 'count':
          this.status.total = r.count
          break
        case 'err':
          this.onError(r)
          break
      }
    })
    const { exclusion, topN } = problem
    this.status = status
    this.exclusion = exclusion
    this.topN = topN
    this.status.total = NaN
    this.buildValues = Array(topN).fill({ w: undefined as any, val: -Infinity })

    this.notifiedBroadcast(this.preprocess(problem))
  }

  async solve() {
    const { exclusion, maxIterateSize } = this
    this.finalizedResults = []

    // Cleanup function from the BPS tracker
    const stopTracking = this.trackBuildsPerSecond()

    await this.execute([{ command: 'count', exclusion, maxIterateSize }])
    stopTracking()
    this.notifiedBroadcast({ command: 'finalize' })
    await this.execute([])
    return this.finalizedResults
  }

  preprocess({
    plotBase,
    optimizationTarget,
    arts,
    topN,
    exclusion,
    constraints,
  }: OptProblemInput): Setup {
    constraints = constraints.filter((x) => x.min > -Infinity)

    let nodes = [...constraints.map((x) => x.value), optimizationTarget]
    const minimums = [...constraints.map((x) => x.min), -Infinity]
    if (plotBase) {
      nodes.push(plotBase)
      minimums.push(-Infinity)
    }

    nodes = pruneExclusion(nodes, exclusion)
    nodes = optimize(nodes, {}, (_) => false)
    ;({ nodes, arts } = pruneAll(nodes, minimums, arts, topN, exclusion, {
      reaffine: true,
      pruneArtRange: true,
      pruneNodeRange: true,
      pruneOrder: true,
    }))
    nodes = optimize(nodes, {}, (_) => false)

    if (plotBase) plotBase = nodes.pop()
    const optTarget = nodes.pop()!

    return {
      command: 'setup',
      arts,
      optTarget,
      plotBase,
      topN,
      constraints: nodes.map((value, i) => ({ value, min: minimums[i] })),
    }
  }

  /** Tracks number of builds processed per second. Returns a cleanup function to be called once Artifact Optimization is complete. */
  private trackBuildsPerSecond() {
    let lastTime = performance.now()
    let lastTested = 0
    let lastSkipped = 0

    const intervalId = setInterval(() => {
      const currentTime = performance.now()
      const elapsedTime = (currentTime - lastTime) / 1000 // in seconds
      const testedDifference = this.status.tested - lastTested
      const skippedDifference = this.status.skipped - lastSkipped

      this.status.testedPerSecond = testedDifference / elapsedTime
      this.status.skippedPerSecond = skippedDifference / elapsedTime

      lastTime = currentTime
      lastTested = this.status.tested
      lastSkipped = this.status.skipped
    }, 1000)

    // Return a cleanup function to stop the interval
    return () => clearInterval(intervalId)
  }

  /** Returns a new `threshold` if altered */
  private interim(r: Interim, worker: Worker) {
    this.status.tested += r.tested
    this.status.failed += r.failed
    this.status.skipped += r.skipped

    if (r.buildValues) {
      const { topN } = this,
        oldThreshold = this.buildValues[topN - 1].val ?? -Infinity

      this.buildValues.filter(({ w }) => w !== worker)
      this.buildValues.push(
        ...r.buildValues.map((val) => ({ w: worker!, val }))
      )
      this.buildValues.sort((a, b) => b.val - a.val).splice(topN)

      const threshold = this.buildValues[topN - 1].val ?? -Infinity
      if (oldThreshold !== threshold)
        this.broadcast({ command: 'threshold', threshold })
    }
  }
}
