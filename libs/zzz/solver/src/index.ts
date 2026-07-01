import { objKeyMap, toDecimal } from '@genshin-optimizer/common/util'
import type { Preset } from '@genshin-optimizer/game-opt/engine'
import type {
  Candidate,
  Progress,
  SolverConfig,
} from '@genshin-optimizer/game-opt/solver'
import { buildCount } from '@genshin-optimizer/game-opt/solver'

import {
  constant,
  detach,
  max,
  prod,
  read,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import type {
  CharacterKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscSetKeys,
  allDiscSlotKeys,
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
import { rainbowFilter } from './filters'

const EPSILON = 1e-7

type Frames = Array<{ tag: Tag; multiplier: number }>

export type CreateSolverConfigArgs = {
  characterKey: CharacterKey
  calc: Calculator
  frames: Frames
  statFilters: Array<Omit<StatFilter, 'disabled'>>
  setFilter2: DiscSetKey[]
  setFilter4: DiscSetKey[]
  wengines: ICachedWengine[]
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  numWorkers: number
  numOfBuilds: number
  setProgress: (progress: Progress) => void
}

type DetachedSolverBase = {
  nodes: NumTagFree[]
  minimum: number[]
}

function buildDetachedSolverBase({
  characterKey,
  calc,
  frames,
  statFilters,
  setFilter2,
  setFilter4,
}: Omit<
  CreateSolverConfigArgs,
  'wengines' | 'discsBySlot' | 'numWorkers' | 'numOfBuilds' | 'setProgress'
>): DetachedSolverBase {
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
      : constant(Number.POSITIVE_INFINITY),
    // filter4: if not empty, at least one >= 4
    setFilter4.length
      ? max(...setFilter4.map((q) => read({ q }, 'sum')))
      : constant(Number.POSITIVE_INFINITY)
    // other calcs (graph, etc)
  )

  return {
    nodes,
    minimum: [
      Number.NEGATIVE_INFINITY, // opt-target itself is also used as a min constraint
      // Invert max constraints for pruning
      ...statFilters.map(({ value, isMax, tag }) => {
        const decimalVal = toDecimal(value, tag.q ?? '')
        return (isMax ? decimalVal * -1 : decimalVal) - EPSILON
      }),
      2, // setFilter2
      4, // setFilter4
    ],
  }
}

function slotCandidates(
  wengines: ICachedWengine[],
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
): Candidate<string>[][] {
  return [
    wengines.map(wengineCandidate),
    ...allDiscSlotKeys.map((slot) => discsBySlot[slot].map(discCandidate)),
  ]
}

function solverConfigFromBase(
  base: DetachedSolverBase,
  candidates: Candidate<string>[][],
  {
    numWorkers,
    numOfBuilds,
    setProgress,
  }: Pick<CreateSolverConfigArgs, 'numWorkers' | 'numOfBuilds' | 'setProgress'>
): SolverConfig<string> {
  return {
    ...base,
    candidates,
    numWorkers,
    topN: numOfBuilds,
    setProgress,
  }
}

export function createSolverConfig(
  args: CreateSolverConfigArgs
): SolverConfig<string> {
  const base = buildDetachedSolverBase(args)
  return solverConfigFromBase(
    base,
    slotCandidates(args.wengines, args.discsBySlot),
    {
      numWorkers: args.numWorkers,
      numOfBuilds: args.numOfBuilds,
      setProgress: args.setProgress,
    }
  )
}

// Orchestrator layer for rainbow / 4:2 batching
export function createOptimizeConfig(
  args: CreateSolverConfigArgs & { allowRainbow: boolean }
): SolverConfig<string> | null {
  const cfg = createSolverConfig(args)
  if (!buildCount(cfg.candidates)) return null
  if (!args.allowRainbow) {
    cfg.filter = rainbowFilter(args)
    if (!cfg.filter?.length) return null // no valid group
  }
  return cfg
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
