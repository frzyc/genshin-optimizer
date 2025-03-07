import type { BuildResult, Progress, Work } from './common'
import { type WorkerConfig, Worker } from './worker'

const reportInterval = 20 // (minimum) progress report interval for each worker, in ms

declare function postMessage(res: Response): void

export type Command = InitMsg | AddWorkMsg | ConfigMsg | ReqWorkMsg
export type Response = AddWorkMsg | RecvWorkMsg | ProgressMsg | ErrMsg

/** initialize the worker for a specific optimization problem */
export type InitMsg = { ty: 'init' } & WorkerConfig
/** update opt target threshold */
export type ConfigMsg = { ty: 'config'; threshold: number }
/** requesting unperformed works. The worker can retain up to `maxKeep` builds */
export type ReqWorkMsg = { ty: 'work?'; maxKeep: number }
/** submitting works */
export type AddWorkMsg = { ty: 'add'; works: Work[] }
/** notify that add-work message has been received */
export type RecvWorkMsg = { ty: 'recv' }
/** progress report */
export type ProgressMsg = {
  ty: 'progress'
  builds: BuildResult[]
  low: boolean
} & Progress
/** error message */
export type ErrMsg = { ty: 'err'; msg: string }

onmessage = async ({ data }: MessageEvent<Command>) => {
  try {
    const res = await processMsg(data)
    if (res) postMessage(res)
  } catch (error) {
    postMessage({ ty: 'err', msg: `${error}` })
  }
}

let worker: Worker
async function processMsg(msg: Command): Promise<Response | undefined> {
  switch (msg.ty) {
    case 'init':
      if (worker) throw new Error('Worker is already initialized')
      worker = new Worker(msg)
      return { ty: 'progress', low: true, ...worker.resetProgress() } // ready
    case 'config':
      worker.setOptThreshold(msg.threshold)
      return
    case 'work?': {
      const works = worker.steal(msg.maxKeep)
      return works.length ? { ty: 'add', works } : undefined
    }
    case 'add':
      worker.add(msg.works)
      return processAllWorks() // runs in the background
  }
}

let nextReport: number | undefined // `undefined` when not running
async function processAllWorks(): Promise<Response | undefined> {
  if (nextReport !== undefined) return // only one runner at a time
  nextReport = Date.now()
  do {
    // Suspend here in case a new config/work stealing is sent over
    //
    // Make sure to use task-based suspensions. Microtask-based ones
    // will simply continue this loop.
    await new Promise((r) => setTimeout(r))

    // pace the reporting to `reportInterval` (except when low on works)
    const now = Date.now()
    const low = worker.subworks.length <= 1
    if (now >= nextReport || low) {
      nextReport = now + reportInterval
      postMessage({ ty: 'progress', low, ...worker.resetProgress() })
    }
    worker.process()
  } while (worker.hasWork())
  nextReport = undefined
  return { ty: 'progress', low: true, ...worker.resetProgress() } // final report
}
