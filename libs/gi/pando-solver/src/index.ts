import { toDecimal } from '@genshin-optimizer/common/util'
import type { Preset } from '@genshin-optimizer/game-opt/engine'
import type {
  Candidate,
  Progress,
  SolverConfig,
} from '@genshin-optimizer/game-opt/solver'
import { buildCount } from '@genshin-optimizer/game-opt/solver'
import type { NumTagFree } from '@genshin-optimizer/pando/engine'
import {
  constant,
  detach,
  max,
  prod,
  read,
  sum,
} from '@genshin-optimizer/pando/engine'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  SubstatKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
import type {
  ICachedArtifact,
  ICachedWeapon,
  PandoStatFilter,
  PandoStatFilterTag,
} from '@genshin-optimizer/gi/db'
import type { Calculator, Tag } from '@genshin-optimizer/gi/formula'
import { Read } from '@genshin-optimizer/gi/formula'
import { rainbowFilter } from './filters'

const EPSILON = 1e-7
const artSetKeys = new Set<string>(allArtifactSetKeys)
const weaponKeys = new Set<string>(allWeaponKeys)

type Frames = Array<{ tag: Tag; multiplier: number }>

export type CreateSolverConfigArgs = {
  calc: Calculator
  frames: Frames
  statFilters: Array<Omit<PandoStatFilter, 'disabled'>>
  setFilter2: ArtifactSetKey[]
  setFilter4: ArtifactSetKey[]
  allowRainbow: boolean
  weapons: ICachedWeapon[]
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
  numWorkers: number
  numOfBuilds: number
  setProgress: (progress: Progress) => void
}

/** gi-db stores plain filter tags; map them to formula `Tag` here. */
export function StatFilterTagToTag(tag: PandoStatFilterTag): Tag {
  return {
    et: 'own',
    sheet: 'agg',
    src: '0',
    q: tag.q,
    qt: tag.qt,
    ...(tag.q === 'dmg_' && tag.ele ? { ele: tag.ele } : {}),
  }
}

type DetachedSolverBase = {
  nodes: NumTagFree[]
  minimum: number[]
}

function buildDetachedSolverBase({
  calc,
  frames,
  statFilters,
  setFilter2,
  setFilter4,
  allowRainbow,
}: Omit<
  CreateSolverConfigArgs,
  'weapons' | 'artsBySlot' | 'numWorkers' | 'numOfBuilds' | 'setProgress'
>): DetachedSolverBase {
  const undetachedNodes = [
    sum(
      ...frames.map((frame, i) =>
        prod(
          frame.multiplier,
          new Read(
            {
              src: '0',
              ...frame.tag,
            },
            undefined
          ).with('preset', `preset${i}` as Preset)
        )
      )
    ),
    ...statFilters.map(({ tag, isMax }) => {
      const newTag: Tag = {
        ...StatFilterTagToTag(tag),
        src: '0',
        preset: 'preset0',
      }
      return isMax
        ? prod(-1, new Read(newTag, undefined))
        : new Read(newTag, undefined)
    }),
  ]

  const nodes = detach(undetachedNodes, calc, (tag: Tag) => {
    if (tag['src'] !== '0') return undefined
    if (tag['et'] !== 'own') return undefined

    if (tag['sheet'] === 'dyn' && tag['qt'] === 'premod')
      return { q: tag['q']! }

    if (tag['q'] === 'count' && artSetKeys.has(tag['sheet'] as string))
      return { q: tag['sheet']! }

    if (
      tag['qt'] === 'weapon' &&
      ['lvl', 'ascension', 'refinement'].includes(tag['q'] as string)
    )
      return { q: tag['q']! }

    if (tag['q'] === 'count' && weaponKeys.has(tag['sheet'] as string))
      return { q: tag['sheet']! }

    return undefined
  })

  const fourPcSets = setFilter4.length ? setFilter4 : [...allArtifactSetKeys]
  const needFourPc = !!setFilter4.length || !allowRainbow

  nodes.push(
    setFilter2.length
      ? max(...setFilter2.map((q) => read({ q }, 'sum')))
      : constant(Number.POSITIVE_INFINITY),
    needFourPc
      ? max(...fourPcSets.map((q) => read({ q }, 'sum')))
      : constant(Number.POSITIVE_INFINITY)
  )

  return {
    nodes,
    minimum: [
      Number.NEGATIVE_INFINITY,
      ...statFilters.map(({ value, isMax, tag }) => {
        const decimalVal = toDecimal(value, tag.q ?? '')
        return (isMax ? decimalVal * -1 : decimalVal) - EPSILON
      }),
      2,
      4,
    ],
  }
}

function slotCandidates(
  weapons: ICachedWeapon[],
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
): Candidate<string>[][] {
  return [
    weapons.map(weaponCandidate),
    ...allArtifactSlotKeys.map((slot) =>
      artsBySlot[slot].map(artifactCandidate)
    ),
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
    slotCandidates(args.weapons, args.artsBySlot),
    {
      numWorkers: args.numWorkers,
      numOfBuilds: args.numOfBuilds,
      setProgress: args.setProgress,
    }
  )
}

export function createOptimizeConfig(
  args: CreateSolverConfigArgs
): SolverConfig<string> | null {
  const cfg = createSolverConfig(args)
  if (!buildCount(cfg.candidates)) return null
  if (!args.allowRainbow) {
    cfg.filter = rainbowFilter(args)
    if (!cfg.filter?.length) return null
  }
  return cfg
}

function artifactCandidate(art: ICachedArtifact): Candidate<string> {
  const { id, mainStatKey, mainStatVal, setKey, substats } = art
  return {
    id,
    [mainStatKey]: mainStatVal,
    ...Object.fromEntries(
      substats
        .filter((sub): sub is typeof sub & { key: SubstatKey } => !!sub.key)
        .map(({ key, accurateValue, value }) => [key, accurateValue || value])
    ),
    [setKey]: 1,
  } as Candidate<string>
}

function weaponCandidate(weapon: ICachedWeapon): Candidate<string> {
  const { id, key, level: lvl, ascension, refinement } = weapon
  return {
    id,
    lvl,
    ascension,
    refinement,
    [key as WeaponKey]: 1,
  } as Candidate<string>
}

export { rainbowFilter } from './filters'
