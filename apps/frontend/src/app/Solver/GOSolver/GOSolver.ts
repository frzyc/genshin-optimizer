import { Count, FinalizeResult, Interim, OptProblemInput, Setup, WorkerCommand, WorkerResult } from ".."
import { optimize } from "../../Formula/optimization"
import { pruneAll, pruneExclusion } from "../common"
import { WorkerCoordinator } from "../coordinator"

export class GOSolver extends WorkerCoordinator<WorkerCommand, WorkerResult> {
  private maxIterateSize = 16_000_000
  private status: Record<'tested' | 'failed' | 'skipped' | 'total', number>
  private exclusion: Count['exclusion']
  private topN: number
  private buildValues: { w: Worker, val: number }[]
  private finalizedResults: FinalizeResult[] = []

  constructor(problem: OptProblemInput, status: GOSolver['status'], numWorker: number) {
    const workers = Array(numWorker).fill(NaN).map(_ => new Worker(new URL('./BackgroundWorker.ts', import.meta.url)))
    super(workers, ['iterate', 'split', 'count'], (r, w) => {
      switch (r.resultType) {
        case 'interim': this.interim(r, w); break
        case 'finalize': this.finalizedResults.push(r); break
        case 'count': this.status.total = r.count; break
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
    await this.execute([{ command: 'count', exclusion, maxIterateSize }])
    this.notifiedBroadcast({ command: 'finalize' })
    await this.execute([])
    return this.finalizedResults
  }

  preprocess({ plotBase, optimizationTarget, arts, topN, exclusion, constraints }: OptProblemInput): Setup {
    constraints = constraints.filter(x => x.min > -Infinity)

    let nodes = [...constraints.map(x => x.value), optimizationTarget]
    const minimums = [...constraints.map(x => x.min), -Infinity]
    if (plotBase) {
      nodes.push(plotBase)
      minimums.push(-Infinity)
    }

    nodes = pruneExclusion(nodes, exclusion);
    ({ nodes, arts } = pruneAll(nodes, minimums, arts, topN, exclusion,
      { reaffine: true, pruneArtRange: true, pruneNodeRange: true, pruneOrder: true }))
    nodes = optimize(nodes, {}, _ => false)

    if (plotBase) plotBase = nodes.pop()
    const optTarget = nodes.pop()!

    return {
      command: "setup", arts, optTarget, plotBase, topN,
      constraints: nodes.map((value, i) => ({ value, min: minimums[i] })),
    }
  }

  /** Returns a new `threshold` if altered */
  private interim(r: Interim, worker: Worker) {
    this.status.tested += r.tested
    this.status.failed += r.failed
    this.status.skipped += r.skipped

    if (r.buildValues) {
      const { topN } = this, oldThreshold = this.buildValues[topN - 1].val ?? -Infinity

      this.buildValues.filter(({ w }) => w !== worker)
      this.buildValues.push(...r.buildValues.map(val => ({ w: worker!, val })))
      this.buildValues.sort((a, b) => b.val - a.val).splice(topN)

      const threshold = this.buildValues[topN - 1].val ?? -Infinity
      if (oldThreshold !== threshold)
        this.broadcast({ command: 'threshold', threshold })
    }
  }
}
