import type { Preset } from '@genshin-optimizer/game-opt/engine'
import type { Candidate, Progress } from '@genshin-optimizer/game-opt/solver'
import { Solver } from '@genshin-optimizer/game-opt/solver'
import { detach, prod, sum } from '@genshin-optimizer/pando/engine'
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

export function optimize(
  characterKey: CharacterKey,
  calc: Calculator,
  frames: Team['frames'],
  topN: number,
  statFilters: Array<Omit<StatFilter, 'disabled'>>,
  lightCones: ICachedLightCone[],
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>,
  numWorkers: number,
  setProgress: (progress: Progress) => void
): Solver<string> {
  // Step 2: Detach nodes from Calculator
  const relicSetKeys = new Set(allRelicSetKeys)
  const lightConeKeys = new Set(allLightConeKeys)
  const undetachedNodes = [
    // optimization target
    sum(
      ...frames.map((frame, i) =>
        prod(
          frame.multiplier,
          new Read(frame.tag, 'sum').with('preset', `preset${i}` as Preset)
        )
      )
    ),
    // min constraints from stat filters; invert max constraints if needed
    ...statFilters.map(({ tag, isMax }) =>
      isMax ? prod(-1, new Read(tag, 'sum')) : new Read(tag, 'sum')
    ),
    // other calcs (graph, etc)
  ]
  const nodes = detach(undetachedNodes, calc, (tag: Tag) => {
    /**
     * Removes relic and lightcone nodes from the opt character, while retaining data from the rest of the team.
     */
    if (tag['src'] !== characterKey) return undefined // Wrong member
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
      return { q: tag['sheet']! } // Light cone counter

    return undefined
  })
  return new Solver({
    nodes,
    // Add -Infinity as the opt-target itself is also used as a min constraint
    // Invert max constraints for pruning
    minimum: [
      -Infinity,
      ...statFilters.map((filter) =>
        filter.isMax ? filter.value * -1 : filter.value
      ),
    ],
    candidates: [
      lightCones.map(convertLightConeToStats),
      relicsBySlot.head.map(convertRelicToStats),
      relicsBySlot.hands.map(convertRelicToStats),
      relicsBySlot.body.map(convertRelicToStats),
      relicsBySlot.feet.map(convertRelicToStats),
      relicsBySlot.sphere.map(convertRelicToStats),
      relicsBySlot.rope.map(convertRelicToStats),
    ],
    numWorkers,
    topN,
    setProgress,
  })
}

function convertRelicToStats(relic: ICachedRelic): Candidate<string> {
  const { id, mainStatKey, level, rarity, setKey, substats } = relic
  return {
    id,
    [mainStatKey]: getRelicMainStatVal(rarity, mainStatKey, level),
    ...Object.fromEntries(
      substats
        .filter(({ key, value }) => key && value)
        .map(({ key, value }) => [key, value])
    ),
    [setKey]: 1,
  } as Candidate<string>
}

function convertLightConeToStats(
  lightCone: ICachedLightCone
): Candidate<string> {
  const { id, key, level: lvl, ascension, superimpose } = lightCone
  return {
    id,
    lvl,
    superimpose,
    ascension,
    [key]: 1,
  } as Candidate<string>
}
