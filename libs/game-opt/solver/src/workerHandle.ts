import type { BuildResult, Counters, Work } from './common'
import { type WorkerConfig, Worker } from './worker'

const reportInterval = 20 // (minimum) progress report interval for each worker, in ms

declare function postMessage(res: Response, transfer?: any[]): void

export type Command = InitMsg | AddWorkMsg | ConfigMsg | ReqWorkMsg
export type Response = AddWorkMsg | ProgressMsg | ErrMsg

/** initialize the worker for a specific optimization problem */
export type InitMsg = { ty: 'init' } & WorkerConfig
/** update opt target threshold */
export type ConfigMsg = { ty: 'config'; threshold: number }
/** requesting unperformed works. The worker can retain up to `maxKeep` builds */
export type ReqWorkMsg = { ty: 'work?'; maxKeep: number }
/** submitting works */
export type AddWorkMsg = { ty: 'add'; works: Work[] }
/** progress report */
export type ProgressMsg = { ty: 'progress'; builds: BuildResult[] } & Counters
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
      return
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

let runner: Promise<undefined> | undefined
function processAllWorks(): Promise<undefined> | undefined {
  if (runner) return undefined // only one runner needed at a time
  return (runner = (async () => {
    let nextReport = Date.now()
    while (worker.hasWork()) {
      const works: Work[] = []
      const subwork = worker.getSubwork(works)
      if (works.length) postMessage({ ty: 'add', works })
      if (subwork) worker.process(subwork)

      // Suspend here in case a new config/work stealing is sent over
      //
      // Make sure to use task-based mechanisms such as `setTimeout` so that
      // this function suspends until the next event loop. If we instead use
      // microtask-based ones such as `Promise.resolved`, the suspension will
      // not be long enough.
      await new Promise((r) => setTimeout(r))

      // pace the reporting to `reportInterval`
      const currentTime = Date.now()
      if (currentTime >= nextReport) {
        nextReport = currentTime + reportInterval
        postMessage({ ty: 'progress', ...worker.progress() })
      }
    }
    postMessage({ ty: 'progress', ...worker.progress() }) // final report
    return (runner = undefined)
  })())
}
