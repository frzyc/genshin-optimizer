import {
  prune,
  type Candidate,
  type NumTagFree,
} from '@genshin-optimizer/pando/engine'
import type { BuildResult, Progress, Work } from './common'
import { buildCount } from './common'
import type { Command, ErrMsg, Response } from './workerHandle'

const reportInterval = 50 // (minimum) progress report interval for solver, in ms

export interface SolverConfig {
  nodes: NumTagFree[]
  minimum: number[]
  candidates: Candidate<string>[][]
  topN: number
  numWorkers: number
  setProgress: (_: Progress) => void
}

type WorkerInfo<ID extends string> = { builds: BuildResult<ID>[] }
type IdleWorkers = { ty: 'idle'; workers: Set<Worker>; works?: never }
type ExcessWorks = { ty: 'work'; workers?: never; works: Work[] }

export class Solver<ID extends string> {
  topN: number
  optThreshold: number

  info = new Map<Worker, WorkerInfo<ID>>()
  state: IdleWorkers | ExcessWorks
  progress: Progress = { computed: 0, failed: 0, skipped: 0, remaining: 0 }

  results: Promise<BuildResult[]>
  nextReport = Date.now()
  report: () => void
  finalize: (result: BuildResult[]) => void = () => {}
  terminate: (reason: any) => void = () => {}

  constructor(cfg: SolverConfig) {
    const { progress } = this
    const { topN, numWorkers, setProgress } = cfg
    const workers = [...Array(numWorkers)].map(
      () =>
        new Worker(new URL('./workerHandle.ts', import.meta.url), {
          type: 'module',
        }),
    )

    const pruned = prune(cfg.nodes, cfg.candidates, 'q', cfg.minimum, topN)
    const { nodes, minimum, candidates } = pruned
    progress.remaining = buildCount(candidates)
    progress.skipped = buildCount(cfg.candidates) - progress.remaining
    if (progress.remaining > Number.MAX_SAFE_INTEGER)
      // We use `remaining` to detect completion. Its accurate
      // bookkeeping is essential to ensure this actually halts.
      throw new Error('too many combinations')

    this.topN = topN
    this.optThreshold = minimum[0]
    this.info = new Map(workers.map((w) => [w, { builds: [] }]))
    const ids = candidates.map((cnds) => cnds.map((c) => c.id))
    this.state = { ty: 'work', works: [{ ids, count: progress.remaining }] }
    this.report = () => setProgress({ ...progress })
    this.results = new Promise((res, rej) => {
      this.finalize = (result) => (this.report(), res(result))
      this.terminate = rej
    })
    const terminate = () => workers.forEach((w) => w.terminate())
    this.results.then(terminate, terminate)

    for (const worker of workers) {
      worker.onmessage = ({ data }) => {
        try {
          this.onWorkerMsg(data, worker)
        } catch (e) {
          this.terminate(e)
        }
      }
      postMsg(worker, { ty: 'init', nodes, minimum, candidates, topN })
    }
  }

  distribute(works: Work[]) {
    const { state } = this
    if (state.ty === 'work') {
      state.works.push(...works)
      return
    }

    for (const worker of state.workers)
      if (!this.give(works, worker)) return
      else state.workers.delete(worker)
    this.state = { ty: 'work', works }
  }

  idle(worker: Worker) {
    const { state, progress, info } = this
    if (state.ty === 'idle') state.workers.add(worker)
    else if (this.give(state.works, worker)) {
      const maxKeep = progress.remaining / (info.size + 0.5) // half a portion at `Solver`
      info.forEach((_, w) => postMsg(w, { ty: 'work?', maxKeep }))
    } else this.state = { ty: 'idle', workers: new Set([worker]) }
  }

  /** returns whether some works are given (`false` implies empty `works`) */
  give(works: Work[], worker: Worker) {
    if (!works.length) return false
    let quota = this.progress.remaining / (this.info.size + 0.5)
    let giveLen = works.findIndex((w) => (quota -= w.count) < 0) + 1
    if (giveLen > 1) giveLen -= 1
    const giving = works.splice(0, giveLen || works.length)
    postMsg(worker, { ty: 'add', works: giving })
    return true
  }

  onWorkerMsg(msg: Response | ErrMsg, worker: Worker) {
    switch (msg.ty) {
      case 'progress': {
        const progress = this.progress
        const info = this.info.get(worker)!
        progress.remaining -= msg.computed + msg.skipped
        progress.computed += msg.computed
        progress.failed += msg.failed
        progress.skipped += msg.skipped
        info.builds = msg.builds as BuildResult<ID>[]

        if (msg.idle) this.idle(worker)

        const now = Date.now()
        if (this.nextReport <= now || !msg.remaining) {
          this.nextReport = now + reportInterval
          this.report()

          const bestBuilds = [...this.info.values()].flatMap((i) => i.builds)
          bestBuilds.sort((a, b) => b.value - a.value)
          const threshold = bestBuilds[this.topN]?.value ?? -Infinity
          if (threshold > this.optThreshold) {
            this.optThreshold = threshold
            this.info.forEach((_, w) => postMsg(w, { ty: 'config', threshold }))
          }

          if (!this.progress.remaining)
            this.finalize(bestBuilds.slice(0, this.topN))
        }
        break
      }
      case 'add':
        this.distribute(msg.works)
        break
      case 'err':
        this.terminate(msg.msg + ' (Worker Error)')
    }
  }
}

function postMsg(worker: Worker, msg: Command) {
  worker.postMessage(msg)
}
