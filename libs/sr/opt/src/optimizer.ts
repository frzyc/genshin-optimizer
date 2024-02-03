import { detach } from '@genshin-optimizer/pando_engine'
import type { RelicSlotKey } from '@genshin-optimizer/sr_consts'
import { allRelicSetKeys } from '@genshin-optimizer/sr_consts'
import type { ICachedRelic } from '@genshin-optimizer/sr_db'
import type { Calculator, Read, Tag } from '@genshin-optimizer/sr_formula'
import type {
  ParentCommand,
  ParentCommandTerminate,
  ParentMessage,
} from './parentWorker'

export interface BuildResult {
  value: number
  ids: Record<RelicSlotKey, string>
}

export interface ProgressResult {
  numBuildsKept: number
  numBuildsComputed: number
}

export class Optimizer {
  private calc: Calculator
  private optTarget: Read
  private relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  private numWorkers: number
  private setProgress: (progress: ProgressResult) => void
  private worker: Worker

  constructor(
    calc: Calculator,
    optTarget: Read,
    relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>,
    numWorkers: number,
    setProgress: (progress: ProgressResult) => void
  ) {
    this.calc = calc
    this.optTarget = optTarget
    this.relicsBySlot = relicsBySlot
    this.numWorkers = numWorkers
    this.setProgress = setProgress

    // Spawn a parent worker to compile nodes, split/filter relics and spawn child workers for calculating results
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
            console.log(data)
            rej()
            break
        }
      }

      // Start worker
      const message: ParentCommand = {
        command: 'start',
        relicsBySlot: this.relicsBySlot,
        detachedNodes: this.detachNodes(),
        numWorkers: this.numWorkers,
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
            console.log(data)
            rej()
            break
        }
      }
    })

    this.worker.terminate()
  }

  private detachNodes() {
    // Step 2: Detach nodes from Calculator
    const relicSetKeys = new Set(allRelicSetKeys)
    const detachedNodes = detach([this.optTarget], this.calc, (tag: Tag) => {
      if (tag['member'] !== 'member0') return undefined // Wrong member
      if (tag['et'] !== 'self') return undefined // Not applied (only) to self

      if (tag['src'] === 'dyn' && tag['qt'] === 'premod')
        return { q: tag['q']! } // Relic stat bonus
      if (tag['q'] === 'count' && relicSetKeys.has(tag['src'] as any))
        return { q: tag['src']! } // Relic set counter
      return undefined
    })
    return detachedNodes
  }
}
