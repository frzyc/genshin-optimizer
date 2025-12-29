import { toDecimal } from '@genshin-optimizer/common/util'
import type { Preset } from '@genshin-optimizer/game-opt/engine'
import type { Candidate, Progress } from '@genshin-optimizer/game-opt/solver'

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
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscSetKeys,
  allWengineKeys,
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
} from '@genshin-optimizer/zzz/consts'
import type { StatFilter } from '@genshin-optimizer/zzz/db'
import {
  type ICachedDisc,
  type ICachedWengine,
  StatFilterTagToTag,
} from '@genshin-optimizer/zzz/db'
import { type Calculator, Read, type Tag } from '@genshin-optimizer/zzz/formula'

const EPSILON = 1e-7

type Frames = Array<{ tag: Tag; multiplier: number }>

export function createSolverConfig(
  characterKey: CharacterKey,
  calc: Calculator,
  frames: Frames,
  statFilters: Array<Omit<StatFilter, 'disabled'>>,
  setFilter2: DiscSetKey[],
  setFilter4: DiscSetKey[],
  wengines: ICachedWengine[],
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>,
  numWorkers: number,
  numOfBuilds: number,
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
          new Read(
            {
              src: characterKey,
              ...frame.tag,
            },
            undefined // undefined as 'infer'
          ).with('preset', `preset${i}` as Preset)
        )
      )
    ),
    // stat filters
    ...statFilters.map(({ tag, isMax }) => {
      // only apply src as tag for stat constraint
      const newTag: Tag = {
        ...StatFilterTagToTag(tag),
        src: characterKey,
        preset: `preset0`,
      }
      // Invert max constraints for pruning, undefined as 'infer'
      return isMax
        ? prod(-1, new Read(newTag, undefined))
        : new Read(newTag, undefined)
    }),
    // other calcs (graph, etc) *go in* `nodes.push` below
  ]

  // converts game-specific calc into a more general representation usable by solver.
  // This will be reused across any number of builds
  const nodes = detach(undetachedNodes, calc, (tag: Tag) => {
    // Removes disc and wengine nodes from the opt character, while retaining data from the rest of the team.
    if (tag['src'] !== characterKey) return undefined // Wrong member
    if (tag['et'] !== 'own') return undefined // Not applied (only) to self

    // dyn is added as a layer in `discTagMapNodeEntries`
    // only `initial` stats are in main/subs of discs.
    if (tag['sheet'] === 'dyn' && tag['qt'] === 'initial')
      if (tag.q === 'dmg_') return { q: `${tag.attribute}_dmg_` }
      else return { q: tag['q']! } // Disc stat bonus

    // Disc set counter
    if (tag['q'] === 'count' && discSetKeys.has(tag['sheet'] as any))
      return { q: tag['sheet']! }

    // wengine bonus
    if (
      tag['qt'] == 'wengine' &&
      ['lvl', 'phase', 'modification'].includes(tag['q'] as string)
    )
      return { q: tag['q']! }

    // wengine counter
    if (tag['q'] === 'count' && wengineKeys.has(tag['sheet'] as any))
      return { q: tag['sheet']! }

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

  return {
    nodes,
    candidates: [
      wengines.map(wengineCandidate),
      discsBySlot['1'].map(discCandidate),
      discsBySlot['2'].map(discCandidate),
      discsBySlot['3'].map(discCandidate),
      discsBySlot['4'].map(discCandidate),
      discsBySlot['5'].map(discCandidate),
      discsBySlot['6'].map(discCandidate),
    ],
    minimum: [
      -Infinity, // opt-target itself is also used as a min constraint
      // Invert max constraints for pruning
      ...statFilters.map(({ value, isMax, tag }) => {
        const decimalVal = toDecimal(value, tag.q ?? '')
        return (isMax ? decimalVal * -1 : decimalVal) - EPSILON
      }),
      2, // setFilter2
      4, // setFilter4
    ],
    numWorkers,
    topN: numOfBuilds,
    setProgress,
  }
}

function discCandidate(disc: ICachedDisc): Candidate<string> {
  const { id, mainStatKey, level, rarity, setKey, substats } = disc
  return {
    id: id as any,
    [mainStatKey]: getDiscMainStatVal(rarity, mainStatKey, level),
    ...Object.fromEntries(
      substats
        .filter(
          (sub): sub is typeof sub & { key: DiscSubStatKey } =>
            !!sub.key && !!sub.upgrades
        )
        .map(({ key, upgrades }) => [
          key,
          getDiscSubStatBaseVal(key, rarity) * upgrades,
        ])
    ),
    [setKey]: 1,
  }
}

function wengineCandidate(wengine: ICachedWengine): Candidate<string> {
  const { id, key, level: lvl, modification, phase } = wengine
  return {
    id: id as any,
    lvl,
    modification,
    phase,
    [key]: 1,
  }
}
