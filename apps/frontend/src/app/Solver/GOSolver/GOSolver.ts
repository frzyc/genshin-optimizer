import type {
  Count,
  FinalizeResult,
  Interim,
  OptProblemInput,
  Setup,
  WorkerCommand,
  WorkerResult,
} from '..'
import { optimize } from '../../Formula/optimization'
import { pruneAll, pruneExclusion } from '../common'
import { WorkerCoordinator } from '../coordinator'

export class GOSolver extends WorkerCoordinator<WorkerCommand, WorkerResult> {
  private maxIterateSize = 32_000_000
  private status: Record<'tested' | 'failed' | 'skipped' | 'total', number>
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
      .map((_) => new Worker(new URL('./BackgroundWorker.ts', import.meta.url)))
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

    this.broadcastCommand(this.preprocess(problem))
  }

  async solve() {
    await this.execute([])
    this.listenEmpty()
    this.listenCommandOverflow()

    const { exclusion, maxIterateSize } = this
    this.finalizedResults = []
    await this.execute([{ command: 'count', exclusion, maxIterateSize }])
    this.broadcastCommand({ command: 'finalize' })
    await this.execute([])
    return this.finalizedResults
  }

  listenEmpty() {
    new Promise((res) => (this.notifyEmpty = () => res(true))).then(() => {
      const numIdle = this.numIdleWorkers()
      if (numIdle > 0) {
        this.broadcastMessage({
          command: 'workerRecvMessage',
          from: 'master',
          data: {
            dataType: 'share',
            numShare: 1,
            maxIterateSize: this.maxIterateSize,
          },
        })
      }
      setTimeout(() => this.listenEmpty(), 1000)
    })
  }

  listenCommandOverflow() {
    new Promise((res) => (this.notifyCommandOverflow = () => res(true))).then(
      () => {
        // commands[0] is iterate()
        if (this.commands[0].length < this.workers.length) {
          this.listenCommandOverflow()
          return
        }

        while (this.commands[0].length > this._workers.length) {
          const { ix } = this._workers.reduce(
            (prev, w, ix) => {
              const tasks = this.workerTracker.get(w)!.tasks
              return tasks < prev.tasks ? { ix, tasks } : prev
            },
            { ix: NaN, tasks: Infinity }
          )

          const command = this.commands[0].pop()!
          this.sendCommand(command, ix)
        }
        setTimeout(() => this.listenCommandOverflow(), 0)
      }
    )
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
        this.broadcastMessage({
          command: 'workerRecvMessage',
          from: 'master',
          data: { dataType: 'threshold', threshold },
        })
    }
  }
}
