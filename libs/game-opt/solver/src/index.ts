import {
  prune,
  type Candidate,
  type NumTagFree,
} from '@genshin-optimizer/pando/engine'
import type { BuildResult, Counters, Work } from './common'
import { buildCount } from './common'
import type { Command, ErrMsg, Response } from './workerHandle'

export type { Candidate } from '@genshin-optimizer/pando/engine'
export type * from './common'

const lowWaterMark = 20000 // replenish if a worker has fewer than this
const highWaterMark = 40000 // replenish until this many builds for each worker below `lowWaterMark`

export interface SolverConfig {
  candidates: Candidate<string>[][]
  nodes: NumTagFree[]
  minimum: number[]
  numWorkers: number
  topN: number
  setProgress: (_: Counters) => void
}

type WorkerInfo<ID extends string> = {
  builds: BuildResult<ID>[]
  remaining: number
}
type IdleWorkers = { ty: 'idle'; workers: Set<Worker> }
type ExcessWorks = { ty: 'work'; works: Work[] }

export class Solver<ID extends string> {
  topN: number
  optThreshold = -Infinity

  info: Map<Worker, WorkerInfo<ID>>
  state: IdleWorkers | ExcessWorks

  counters: Counters = {
    computed: 0,
    failed: 0,
    skipped: 0,
    remaining: 0,
  }

  donePromise: Promise<BuildResult[]>
  finalize: (_: BuildResult[]) => void = () => {}
  throws: (_: any) => void = () => {}
  setProgress: (_: Counters) => void

  constructor(cfg: SolverConfig) {
    const counters = this.counters
    const pruned = prune(cfg.nodes, cfg.candidates, 'q', cfg.minimum, cfg.topN)
    const { nodes, candidates, minimum } = pruned
    counters.remaining = buildCount(candidates)
    counters.skipped = buildCount(cfg.candidates) - counters.remaining
    this.topN = cfg.topN
    this.setProgress = cfg.setProgress
    this.donePromise = new Promise((res, rej) => {
      this.finalize = res
      this.throws = rej
    })

    const workerUrl = new URL('./workerHandle.ts', import.meta.url)
    const workers = [...Array(cfg.numWorkers)].map(
      () => new Worker(workerUrl, { type: 'module' })
    )
    this.info = new Map(workers.map((w) => [w, { builds: [], remaining: 0 }]))
    this.state = { ty: 'idle', workers: new Set(workers) }
    for (const worker of workers) {
      worker.onmessage = ({ data }) => {
        try {
          this.onChildMsg(data, worker)
        } catch (e) {
          this.throws(e)
        }
      }
      postMsg(worker, {
        ty: 'init',
        nodes,
        minimum,
        candidates,
        topN: cfg.topN,
      })
    }

    const ids = candidates.map((cnds) => cnds.map((c) => c.id))
    this.distribute([{ ids, count: counters.remaining }])
  }

  progress(): Counters {
    return { ...this.counters }
  }

  async results(): Promise<BuildResult[]> {
    return this.donePromise
  }

  terminate(reason = new Error('terminated')) {
    this.info.forEach((_, w) => w.terminate())
    this.throws(reason)
  }

  distribute(works: Work[]) {
    const { state } = this
    if (state.ty === 'work') {
      state.works.push(...works)
      return
    }

    for (const worker of state.workers)
      if (this.give(works, worker)) state.workers.delete(worker)
      else return
    this.state = { ty: 'work', works }
  }

  idle(worker: Worker) {
    const { state } = this
    if (state.ty === 'idle') state.workers.add(worker)
    else if (!this.give(state.works, worker))
      this.state = { ty: 'idle', workers: new Set([worker]) }
  }

  /**
   * Give `works` to `worker`, returning whether the worker is now above water mark.
   * If returned `false`, `works` will be empty.
   */
  give(works: Work[], worker: Worker) {
    if (!works.length) return false
    const info = this.info.get(worker)!
    let quota = highWaterMark - info.remaining
    const numGive = works.findIndex((w) => (quota -= w.count) < 0) + 1
    const giving = works.splice(0, numGive || works.length)

    info.remaining = highWaterMark - quota
    postMsg(worker, { ty: 'add', works: giving })
    const avg = this.counters.remaining / this.info.size
    if (info.remaining > avg && avg > highWaterMark)
      postMsg(worker, { ty: 'work?', maxKeep: avg }) // too many, taking some back
    return info.remaining >= lowWaterMark
  }

  onChildMsg(msg: Response | ErrMsg, worker: Worker) {
    switch (msg.ty) {
      case 'progress': {
        const counters = this.counters
        const info = this.info.get(worker)!
        counters.remaining -= msg.computed + msg.skipped
        counters.computed += msg.computed
        counters.failed += msg.failed
        counters.skipped += msg.skipped
        info.remaining = msg.remaining
        info.builds = msg.builds as BuildResult<ID>[]

        if (msg.remaining < lowWaterMark) this.idle(worker)

        const bestBuilds = [...this.info.values()].flatMap((i) => i.builds)
        bestBuilds.sort((a, b) => b.value - a.value)
        const threshold = bestBuilds[this.topN]?.value ?? -Infinity
        if (threshold > this.optThreshold) {
          this.optThreshold = threshold
          const msg = { ty: 'config' as const, threshold }
          this.info.forEach((_, w) => postMsg(w, msg))
        }

        this.setProgress(this.counters)
        if (!this.counters.remaining)
          this.finalize(bestBuilds.slice(0, this.topN))
        break
      }
      case 'add': {
        const info = this.info.get(worker)!
        info.remaining -= msg.works.reduce((c, w) => c + w.count, 0)
        this.distribute(msg.works)
        break
      }
      case 'err':
        throw msg.error
    }
  }
}

function postMsg(worker: Worker, msg: Command) {
  worker.postMessage(msg)
}
