import { detach, sum } from '@genshin-optimizer/pando/engine'
import type { CharacterKey, RelicSlotKey } from '@genshin-optimizer/sr/consts'
import { allRelicSetKeys } from '@genshin-optimizer/sr/consts'
import type { Combo, ICachedRelic, StatFilter } from '@genshin-optimizer/sr/db'
import {
  Read,
  type Calculator,
  type Preset,
  type Tag,
} from '@genshin-optimizer/sr/formula'
import type {
  ParentCommandStart,
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

export class Solver {
  private calc: Calculator
  private frames: Combo['frames']
  private statFilters: Array<Omit<StatFilter, 'disabled'>>
  private relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  private numWorkers: number
  private setProgress: (progress: ProgressResult) => void
  private worker: Worker
  private characterKey: CharacterKey

  constructor(
    characterKey: CharacterKey,
    calc: Calculator,
    frames: Combo['frames'],
    statFilters: Array<Omit<StatFilter, 'disabled'>>,
    relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>,
    numWorkers: number,
    setProgress: (progress: ProgressResult) => void
  ) {
    this.characterKey = characterKey
    this.calc = calc
    this.frames = frames
    this.statFilters = statFilters
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
      const message: ParentCommandStart = {
        command: 'start',
        relicsBySlot: this.relicsBySlot,
        detachedNodes: this.detachNodes(),
        constraints: this.statFilters.map(({ value, isMax }) => ({
          value,
          isMax,
        })),
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
    const detachedNodes = detach(
      [
        // combo
        sum(
          ...this.frames.map((frame, i) =>
            new Read(frame.tag, frame.ex).with('preset', `preset${i}` as Preset)
          )
        ),
        // stat filters
        ...this.statFilters.map(({ read }) => read),
      ],
      this.calc,
      (tag: Tag) => {
        if (tag['src'] !== this.characterKey) return undefined // Wrong member
        if (tag['et'] !== 'own') return undefined // Not applied (only) to self

        if (tag['sheet'] === 'dyn' && tag['qt'] === 'premod')
          return { q: tag['q']! } // Relic stat bonus
        if (tag['q'] === 'count' && relicSetKeys.has(tag['sheet'] as any))
          return { q: tag['sheet']! } // Relic set counter
        return undefined
      }
    )
    return detachedNodes
  }
}
