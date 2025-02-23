import type { Preset } from '@genshin-optimizer/game-opt/engine'
import type {
  BuildResult,
  BuildResultByIndex,
  EquipmentStats,
  ParentCommandStart,
  ParentCommandTerminate,
  ParentMessage,
  ProgressResult,
} from '@genshin-optimizer/game-opt/solver'
import { detach, prod, prune, sum } from '@genshin-optimizer/pando/engine'
import type { CharacterKey, RelicSlotKey } from '@genshin-optimizer/sr/consts'
import { allLightConeKeys, allRelicSetKeys } from '@genshin-optimizer/sr/consts'
import type {
  ICachedLightCone,
  ICachedRelic,
  StatFilter,
  Team,
} from '@genshin-optimizer/sr/db'
import { Read, type Calculator, type Tag } from '@genshin-optimizer/sr/formula'
import { getRelicMainStatVal } from '@genshin-optimizer/sr/util'

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
  private topN = 10

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
    this.worker = new Worker(
      new URL('../../../game-opt/solver/src/parentWorker.ts', import.meta.url),
      {
        type: 'module',
      }
    )
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
            res(
              data.buildResults.map(
                createConvertBuildResult(this.lightCones, this.relicsBySlot)
              )
            )
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
        this.lightCones.map(convertLightConeToStats),
        this.relicsBySlot.head.map(convertRelicToStats),
        this.relicsBySlot.hands.map(convertRelicToStats),
        this.relicsBySlot.body.map(convertRelicToStats),
        this.relicsBySlot.feet.map(convertRelicToStats),
        this.relicsBySlot.sphere.map(convertRelicToStats),
        this.relicsBySlot.rope.map(convertRelicToStats),
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
    const relicSetKeys = new Set(allRelicSetKeys)
    const lightConeKeys = new Set(allLightConeKeys)
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
       * Removes relic and lightcone nodes from the opt character, while retaining data from the rest of the team.
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
    })
    // Invert max constraints for pruning
    const constraints = this.statFilters.map((filter) =>
      filter.isMax ? filter.value * -1 : filter.value
    )
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

function convertRelicToStats(
  relic: ICachedRelic,
  index: number
): EquipmentStats {
  const { mainStatKey, level, rarity, setKey, substats } = relic
  return {
    id: index,
    [mainStatKey]: getRelicMainStatVal(rarity, mainStatKey, level),
    ...Object.fromEntries(
      substats
        .filter(({ key, value }) => key && value)
        .map(({ key, value }) => [key, value])
    ),
    [setKey]: 1,
  }
}

function convertLightConeToStats(
  lightCone: ICachedLightCone,
  index: number
): EquipmentStats {
  const { key, level: lvl, ascension, superimpose } = lightCone
  return {
    id: index,
    lvl,
    superimpose,
    ascension,
    [key]: 1,
  }
}

function createConvertBuildResult(
  lightCones: ICachedLightCone[],
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
) {
  const arr = [
    lightCones,
    relicsBySlot.head,
    relicsBySlot.hands,
    relicsBySlot.body,
    relicsBySlot.feet,
    relicsBySlot.sphere,
    relicsBySlot.rope,
  ]
  return function ({ value, indices }: BuildResultByIndex): BuildResult {
    return {
      value,
      ids: indices.map(
        (equipIndex, listIndex) => arr[listIndex][equipIndex].id
      ),
    }
  }
}
