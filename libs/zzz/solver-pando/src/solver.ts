import type { Preset } from '@genshin-optimizer/game-opt/engine'
import { Solver, type Progress } from '@genshin-optimizer/game-opt/solver'
import type { Candidate } from '@genshin-optimizer/pando/engine'
import {
  constant,
  detach,
  max,
  prod,
  read,
  sum,
} from '@genshin-optimizer/pando/engine'
import type {
  CharacterKey,
  DiscSetKey,
  DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
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

export function optimize(
  characterKey: CharacterKey,
  calc: Calculator,
  frames: Frames,
  statFilters: Array<Omit<StatFilter, 'disabled'>>,
  setFilter2: DiscSetKey[],
  setFilter4: DiscSetKey[],
  wengines: ICachedWengine[],
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
  numWorkers: number,
  setProgress: (progress: Progress) => void
) {
  const discSetKeys = new Set(allDiscSetKeys)
  const wengineKeys = new Set(allWengineKeys)
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
    // stat filters
    ...statFilters.map(({ tag, isMax }) =>
      // Invert max constraints for pruning
      isMax ? prod(-1, new Read(tag, 'sum')) : new Read(tag, 'sum')
    ),
    // other calcs (graph, etc) *go in* `nodes.push` below
  ]
  const nodes = detach(undetachedNodes, calc, (tag: Tag) => {
    /**
     * Removes disc and wengine nodes from the opt character, while retaining data from the rest of the team.
     */
    if (tag['src'] !== characterKey) return undefined // Wrong member
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
  nodes.push(
    // filter2: if not empty, at least one >= 2
    setFilter2.length
      ? max(...setFilter2.map((q) => read({ q }, 'sum')))
      : constant(Infinity),
    // filter4: if not empty, at least one >= 4
    setFilter4.length
      ? max(...setFilter4.map((q) => read({ q }, 'sum')))
      : constant(Infinity)
    // other calcs (graph, etc)
  )

  return new Solver({
    nodes,
    candidates: [
      wengines.map(convertWengineToStats),
      discsBySlot['1'].map(convertDiscToStats),
      discsBySlot['2'].map(convertDiscToStats),
      discsBySlot['3'].map(convertDiscToStats),
      discsBySlot['4'].map(convertDiscToStats),
      discsBySlot['5'].map(convertDiscToStats),
      discsBySlot['6'].map(convertDiscToStats),
    ],
    minimum: [
      -Infinity, // opt-target itself is also used as a min constraint
      // Invert max constraints for pruning
      ...statFilters.map((filter) =>
        filter.isMax ? filter.value * -1 : filter.value
      ),
      2, // setFilter2
      4, // setFilter4
    ],
    numWorkers,
    topN: 10, // TODO
    setProgress,
  })
}

function convertDiscToStats(disc: ICachedDisc): Candidate<string> {
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
  } as Candidate<string>
}

function convertWengineToStats(wengine: ICachedWengine): Candidate<string> {
  const { id, key, level: lvl, modification, phase } = wengine
  return {
    id,
    lvl,
    modification,
    phase,
    [key]: 1,
  } as Candidate<string>
}
