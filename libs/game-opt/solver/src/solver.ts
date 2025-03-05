import {
  prune,
  type Candidate,
  type NumTagFree,
} from '@genshin-optimizer/pando/engine'
import type { BuildResult, Progress, Work } from './common'
import { buildCount } from './common'
import type { Command, ErrMsg, Response } from './workerHandle'

const waterMark = 40_000 // replenish if a worker has fewer than this

export interface SolverConfig {
  candidates: Candidate<string>[][]
  nodes: NumTagFree[]
  minimum: number[]
  numWorkers: number
  topN: number
  setProgress: (_: Progress) => void
}

type WorkerInfo<ID extends string> = { builds: BuildResult<ID>[] }
type IdleWorkers = { ty: 'idle'; workers: Set<Worker> }
type ExcessWorks = { ty: 'work'; works: Work[] }

export class Solver<ID extends string> {
  topN: number
  optThreshold: number

  info = new Map<Worker, WorkerInfo<ID>>()
  state: IdleWorkers | ExcessWorks
  progress: Progress = { computed: 0, failed: 0, skipped: 0, remaining: 0 }

  results: Promise<BuildResult[]>
  report: () => void
  finalize: (result: BuildResult[]) => void = () => {}
  terminate: (reason: any) => void = () => {}

  constructor(cfg: SolverConfig) {
    const { progress } = this
    const { topN, numWorkers, setProgress } = cfg
    const workerUrl = new URL('./workerHandle.ts', import.meta.url)
    const workers = [...Array(numWorkers)].map(
      () => new Worker(workerUrl, { type: 'module' })
    )

    const pruned = prune(cfg.nodes, cfg.candidates, 'q', cfg.minimum, topN)
    const { nodes, candidates, minimum } = pruned
    progress.remaining = buildCount(candidates)
    progress.skipped = buildCount(cfg.candidates) - progress.remaining

    const ids = candidates.map((cnds) => cnds.map((c) => c.id))
    this.topN = topN
    this.optThreshold = minimum[0]
    this.info = new Map(workers.map((w) => [w, { builds: [] }]))
    this.state = { ty: 'work', works: [{ ids, count: progress.remaining }] }
    this.report = () => setProgress({ ...this.progress })
    this.results = new Promise((res, rej) => {
      this.finalize = (result) => (this.report(), res(result))
      this.terminate = rej
    })
    const terminate = () => workers.forEach((w) => w.terminate())
    this.results.then(terminate, terminate)

    const msg = { ty: 'init' as const, nodes, minimum, candidates, topN }
    for (const worker of workers) {
      worker.onmessage = (msg) => {
        try {
          this.onWorkerMsg(msg.data, worker)
        } catch (e) {
          this.terminate(e)
        }
      }
      postMsg(worker, msg)
    }
  }

  distribute(works: Work[]) {
    const { state } = this
    if (state.ty === 'work') {
      state.works.push(...works)
      return
    }

    for (const worker of state.workers)
      if (this.give(works, worker)) return
      else state.workers.delete(worker)
    this.state = { ty: 'work', works }
  }

  idle(worker: Worker) {
    const { state, progress, info } = this
    if (state.ty === 'idle') state.workers.add(worker)
    else if (this.give(state.works, worker))
      this.state = { ty: 'idle', workers: new Set([worker]) }
    else return // no more idle workers

    const maxKeep = progress.remaining / (info.size + 1) // one portion at `Solver`
    const msg = { ty: 'work?' as const, maxKeep }
    info.forEach((_, w) => postMsg(w, msg))
  }

  /** returns whether `worker` needs more work (and `works` are emptied) */
  give(works: Work[], worker: Worker) {
    if (!works.length) return true
    const avg = this.progress.remaining / (this.info.size + 2) // lower than `maxKeep` in `idle`
    const target = Math.ceil(Math.max(avg, waterMark))
    let quota = target
    const giveLen = works.findIndex((w) => (quota -= w.count) < 0) + 1
    const giving = works.splice(0, giveLen || works.length)
    postMsg(worker, { ty: 'add', works: giving })
    return target - quota < waterMark // implies `quota > target - waterMark >= 0`, i.e., `works` are emptied
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

        if (msg.remaining < waterMark) this.idle(worker)

        const bestBuilds = [...this.info.values()].flatMap((i) => i.builds)
        bestBuilds.sort((a, b) => b.value - a.value)
        const threshold = bestBuilds[this.topN]?.value ?? -Infinity
        if (threshold > this.optThreshold) {
          this.optThreshold = threshold
          const msg = { ty: 'config' as const, threshold }
          this.info.forEach((_, w) => postMsg(w, msg))
        }

        this.report() // TODO: pace this?
        if (!this.progress.remaining) this.finalize(bestBuilds)
        break
      }
      case 'add': {
        this.distribute(msg.works)
        break
      }
      case 'err':
        this.terminate(msg.msg + ' (Worker Error)')
    }
  }
}

function postMsg(worker: Worker, msg: Command) {
  worker.postMessage(msg)
}
