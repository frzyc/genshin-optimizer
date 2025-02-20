import { objMap } from '@genshin-optimizer/common/util'
import type { Preset } from '@genshin-optimizer/game-opt/engine'
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
import type {
  BuildResult,
  BuildResultByIndex,
  EquipmentStats,
  ProgressResult,
} from './common'
import type {
  ParentCommandStart,
  ParentCommandTerminate,
  ParentMessage,
} from './parentWorker'

export class Solver {
  private calc: Calculator
  private frames: Team['frames']
  private statFilters: Array<Omit<StatFilter, 'disabled'>>
  private lightCones: ICachedLightCone[]
  private relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  private lightConeStats: EquipmentStats[]
  private relicStatsBySlot: Record<RelicSlotKey, EquipmentStats[]>
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
    this.lightConeStats = lightCones.map(convertLightConeToStats)
    this.relicsBySlot = relicsBySlot
    this.relicStatsBySlot = objMap(relicsBySlot, (relics) =>
      relics.map(convertRelicToStats)
    )
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
            res(data.buildResults.map(this.convertBuildResult))
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
        lightConeStats: this.lightConeStats,
        relicStatsBySlot: this.relicStatsBySlot,
        detachedNodes: this.detachAndPruneNodes(),
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

  private detachAndPruneNodes() {
    // Step 2: Detach nodes from Calculator
    const relicSetKeys = new Set(allRelicSetKeys)
    const lightConeKeys = new Set(allLightConeKeys)
    const nodes = [
      // stat filters
      ...this.statFilters.map(({ tag }) => new Read(tag, 'sum')),
      // other calcs (graph, etc)
      // optimization targets
      sum(
        ...this.frames.map((frame, i) =>
          prod(
            frame.multiplier,
            new Read(frame.tag, 'sum').with('preset', `preset${i}` as Preset)
          )
        )
      ),
    ]
    const detachedNodes = detach(nodes, this.calc, (tag: Tag) => {
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
    })
    const buildComponents = [
      this.lightConeStats,
      // 1-by-1 for deterministic order
      this.relicStatsBySlot.head,
      this.relicStatsBySlot.hands,
      this.relicStatsBySlot.body,
      this.relicStatsBySlot.feet,
      this.relicStatsBySlot.sphere,
      this.relicStatsBySlot.rope,
    ]
    const constraints = this.statFilters.map((filter) =>
      filter.isMax ? filter.value * -1 : filter.value
    )
    const {
      nodes: prunedNodes,
      candidates,
      minimum,
    } = prune(detachedNodes, buildComponents, 'q', constraints, this.topN)
    this.lightConeStats = candidates[0]
    // 1-by-1 for deterministic order
    this.relicStatsBySlot.head = candidates[1]
    this.relicStatsBySlot.hands = candidates[2]
    this.relicStatsBySlot.body = candidates[3]
    this.relicStatsBySlot.feet = candidates[4]
    this.relicStatsBySlot.sphere = candidates[5]
    this.relicStatsBySlot.rope = candidates[6]
    minimum.map((v, i) => (this.statFilters[i].value = v))
    return prunedNodes
  }

  private convertBuildResult({
    value,
    lightConeIndex,
    relicIndices,
  }: BuildResultByIndex): BuildResult {
    return {
      value,
      lightConeId: this.lightCones[lightConeIndex].id,
      relicIds: objMap(
        relicIndices,
        (index, slot) => this.relicsBySlot[slot][index].id
      ),
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
