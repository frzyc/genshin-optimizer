import { detach, sum } from '@genshin-optimizer/pando/engine'
import type { CharacterKey, RelicSlotKey } from '@genshin-optimizer/sr/consts'
import { allLightConeKeys, allRelicSetKeys } from '@genshin-optimizer/sr/consts'
import type {
  ICachedLightCone,
  ICachedRelic,
  StatFilter,
  Team,
} from '@genshin-optimizer/sr/db'
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
  lightConeId: string
  relicIds: Record<RelicSlotKey, string>
}

export interface ProgressResult {
  numBuildsKept: number
  numBuildsComputed: number
}

export class Solver {
  private calc: Calculator
  private frames: Team['frames']
  private statFilters: Array<Omit<StatFilter, 'disabled'>>
  private lightCones: ICachedLightCone[]
  private relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  private numWorkers: number
  private setProgress: (progress: ProgressResult) => void
  private worker: Worker
  private characterKey: CharacterKey

  constructor(
    characterKey: CharacterKey,
    calc: Calculator,
    frames: Team['frames'],
    statFilters: Array<Omit<StatFilter, 'disabled'>>,
    lightCones: ICachedLightCone[],
    relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>,
    numWorkers: number,
    setProgress: (progress: ProgressResult) => void
  ) {
    this.characterKey = characterKey
    this.calc = calc
    this.frames = frames
    this.statFilters = statFilters
    this.lightCones = lightCones
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
            console.error(data)
            rej()
            break
        }
      }

      // Start worker
      const message: ParentCommandStart = {
        command: 'start',
        lightCones: this.lightCones,
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
            console.error(data)
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
    const lightConeKeys = new Set(allLightConeKeys)
    const detachedNodes = detach(
      [
        // team
        sum(
          ...this.frames.map((frame, i) =>
            new Read(frame, 'sum').with('preset', `preset${i}` as Preset)
          )
        ),
        // stat filters
        ...this.statFilters.map(({ tag }) => new Read(tag, 'sum')),
      ],
      this.calc,
      (tag: Tag) => {
        /**
         * Removes relic and lightcone nodes from the opt character, while retaining data from the rest of the team.
         * TODO: make lightcone node detachment opt-in.
         */
        if (tag['src'] !== this.characterKey) return undefined // Wrong member
        if (tag['et'] !== 'own') return undefined // Not applied (only) to self

        if (tag['sheet'] === 'dyn' && tag['qt'] === 'premod')
          return { q: tag['q']! } // Relic stat bonus
        if (tag['q'] === 'count' && relicSetKeys.has(tag['sheet'] as any))
          return { q: tag['sheet']! } // Relic set counter
        if (
          tag['qt'] == 'lightCone' &&
          ['lvl', 'ascension', 'superimpose'].includes(tag['q'] as string)
        )
          return { q: tag['q']! } // Light cone bonus
        if (tag['q'] === 'count' && lightConeKeys.has(tag['sheet'] as any))
          return { q: tag['sheet']! } // Relic set counter

        return undefined
      }
    )
    return detachedNodes
  }
}
