import type { Preset } from '@genshin-optimizer/game-opt/engine'
import type {
  BuildResult,
  EquipmentStats,
  ParentCommandStart,
  ParentCommandTerminate,
  ParentMessage,
  ProgressResult,
} from '@genshin-optimizer/game-opt/solver'
import { detach, prod, prune, sum } from '@genshin-optimizer/pando/engine'
import type { CharacterKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSetKeys,
  allWengineKeys,
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc, ICachedWengine } from '@genshin-optimizer/zzz/db'
import { Read, type Calculator, type Tag } from '@genshin-optimizer/zzz/formula'
type Frames = Array<{ tag: Tag; multiplier: number }>
type StatFilter = {
  tag: Tag
  value: number
  isMax: boolean
}
export class Solver {
  private calc: Calculator
  private frames: Frames
  private statFilters: Array<StatFilter>
  private wengines: ICachedWengine[]
  private discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  private numWorkers: number
  private setProgress: (progress: ProgressResult) => void
  private worker: Worker
  private characterKey: CharacterKey
  private topN = 10

  constructor(
    characterKey: CharacterKey,
    calc: Calculator,
    frames: Frames,
    statFilters: Array<Omit<StatFilter, 'disabled'>>,
    wengines: ICachedWengine[],
    discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
    numWorkers: number,
    setProgress: (progress: ProgressResult) => void
  ) {
    this.characterKey = characterKey
    this.calc = calc
    this.frames = frames
    this.statFilters = statFilters
    this.wengines = wengines
    this.discsBySlot = discsBySlot
    this.numWorkers = numWorkers
    this.setProgress = setProgress

    // Spawn a parent worker to compile nodes, split/filter discs and spawn child workers for calculating results
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
      // Call first for side effects to other properties
      const stats = [
        this.wengines.map(convertWengineToStats),
        this.discsBySlot['1'].map(convertDiscToStats),
        this.discsBySlot['2'].map(convertDiscToStats),
        this.discsBySlot['3'].map(convertDiscToStats),
        this.discsBySlot['4'].map(convertDiscToStats),
        this.discsBySlot['5'].map(convertDiscToStats),
        this.discsBySlot['6'].map(convertDiscToStats),
      ]
      const { prunedNodes, prunedMinumum, prunedStats } =
        this.detachAndPrune(stats)
      const message: ParentCommandStart = {
        command: 'start',
        detachedNodes: prunedNodes,
        equipmentStats: prunedStats,
        constraints: prunedMinumum,
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

  private detachAndPrune(equipmentStats: EquipmentStats[][]) {
    // Step 2: Detach nodes from Calculator
    const discSetKeys = new Set(allDiscSetKeys)
    const wengineKeys = new Set(allWengineKeys)
    const nodes = [
      // optimization target
      sum(
        ...this.frames.map((frame, i) =>
          prod(
            frame.multiplier,
            new Read(frame.tag, 'sum').with('preset', `preset${i}` as Preset)
          )
        )
      ),
      // stat filters
      ...this.statFilters.map(({ tag, isMax }) =>
        // Invert max constraints for pruning
        isMax ? prod(-1, new Read(tag, 'sum')) : new Read(tag, 'sum')
      ),
      // other calcs (graph, etc)
    ]
    const detachedNodes = detach(nodes, this.calc, (tag: Tag) => {
      /**
       * Removes disc and wengine nodes from the opt character, while retaining data from the rest of the team.
       */
      if (tag['src'] !== this.characterKey) return undefined // Wrong member
      if (tag['et'] !== 'own') return undefined // Not applied (only) to self

      if (tag['sheet'] === 'dyn' && tag['qt'] === 'premod')
        return { q: tag['q']! } // Disc stat bonus
      if (tag['q'] === 'count' && discSetKeys.has(tag['sheet'] as any))
        return { q: tag['sheet']! } // Disc set counter
      if (
        tag['qt'] == 'wengine' &&
        ['lvl', 'phase', 'modification'].includes(tag['q'] as string)
      )
        return { q: tag['q']! } // wengine bonus
      if (tag['q'] === 'count' && wengineKeys.has(tag['sheet'] as any))
        return { q: tag['sheet']! } // wengine counter

      return undefined
    })
    // Add -Infinity as the opt-target itself is also used as a min constraint
    // Invert max constraints for pruning
    const constraints = [
      -Infinity,
      ...this.statFilters.map((filter) =>
        filter.isMax ? filter.value * -1 : filter.value
      ),
    ]
    const {
      nodes: prunedNodes,
      candidates: prunedCandidates,
      minimum: prunedMinumum,
    } = prune(detachedNodes, equipmentStats, 'q', constraints, this.topN)
    return {
      prunedNodes,
      prunedMinumum,
      prunedStats: prunedCandidates,
    }
  }
}

function convertDiscToStats(disc: ICachedDisc): EquipmentStats {
  const { id, mainStatKey, level, rarity, setKey, substats } = disc
  return {
    id,
    [mainStatKey]: getDiscMainStatVal(rarity, mainStatKey, level),
    ...Object.fromEntries(
      substats
        .filter(({ key, upgrades }) => key && upgrades)
        .map(({ key, upgrades }) => [
          key,
          getDiscSubStatBaseVal(key, rarity) * upgrades,
        ])
    ),
    [setKey]: 1,
  } as EquipmentStats
}

function convertWengineToStats(wengine: ICachedWengine): EquipmentStats {
  const { id, key, level: lvl, modification, phase } = wengine
  return {
    id,
    lvl,
    modification,
    phase,
    [key]: 1,
  } as EquipmentStats
}
