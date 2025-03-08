import type { BuildResult, Progress, Work } from './common'
import { type WorkerConfig, Worker } from './worker'

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
  idle: boolean
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
      if (worker) throw new Error('already initialized')
      worker = new Worker(msg)
      return { ty: 'progress', idle: true, ...worker.resetProgress() } // ready
    case 'config':
      worker.setOptThreshold(msg.threshold)
      return
    case 'work?': {
      const works = worker.steal(msg.maxKeep)
      return works.length ? { ty: 'add', works } : undefined
    }
    case 'add':
      worker.add(msg.works)
      return processAllWorks()
  }
}

let running = false
async function processAllWorks(): Promise<Response | undefined> {
  if (running) return // only one runner at a time
  running = true
  let idle: boolean
  do {
    // Suspend here in case a new config/work stealing is sent over
    //
    // Make sure to use task-based suspensions. Microtask-based ones
    // will simply continue this loop.
    await new Promise((r) => setTimeout(r))

    idle = worker.subworks.length <= 1 // will `idle` after `process`, send msg first
    postMessage({ ty: 'progress', idle, ...worker.resetProgress() })
    worker.process()
  } while (worker.hasWork())
  running = false
  return { ty: 'progress', idle: !idle, ...worker.resetProgress() } // `idle` if not already
}
