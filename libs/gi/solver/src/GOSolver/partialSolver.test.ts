import { cartesian, objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import {
  dynRead,
  frac,
  precompute,
  prod,
  sum,
  threshold,
} from '@genshin-optimizer/gi/wr'
import type {
  ArtifactBuildData,
  ArtifactsBySlot,
  DynMinMax,
  DynStat,
  FutureArtifactProfile,
} from '../common'
import { mergePartialCandidates } from '../common'
import type { OptProblemInput, Setup } from '../type'
import { BNBSplitWorker } from './BNBSplitWorker'
import type { SplitWorker } from './BackgroundWorker'
import { ComputeWorker } from './ComputeWorker'
import { DefaultSplitWorker } from './DefaultSplitWorker'
import { GOSolver } from './GOSolver'
import { tightenPartialBuilds } from './tightenPartials'

/**
 * End-to-end smoke test of the `partialBuilds` flow, mirroring what the
 * worker pipeline does: real `GOSolver.preprocess` (which reaffines the solve
 * space and snapshots the original space for partial tracking), split/compute
 * workers with threshold feedback, candidate accumulation, and the final
 * tighten pass.
 *
 * Note: solve-time pruning is *not* future-aware yet, so candidates whose
 * builds were all pruned may be missing — coverage here is only asserted
 * against the accumulated candidates, not the full artifact product (that
 * stronger check lives in tightenPartials.test.ts, where candidates are
 * exhaustive).
 */

const hp = sum(dynRead('hp'), prod(13471, dynRead('hp_')))
const crcd = sum(1, prod(dynRead('critRate_'), dynRead('critDMG_')))
const dmg_ = sum(
  1,
  dynRead('hydroDmg_'),
  threshold(dynRead('HeartOfDepth'), 2, 0.2, 0),
  threshold(dynRead('HeartOfDepth'), 4, 0.35, 0)
)
const er = dynRead('enerRech_')
const em = prod(2.78, frac(dynRead('eleMas'), 1400))
const target = prod(hp, dmg_, crcd, em)

const art = (
  id: string,
  set: ArtifactSetKey,
  values: Record<string, number>
): ArtifactBuildData => ({ id, set, values: { ...values, [set]: 1 } })
const exampleArts: ArtifactsBySlot = {
  base: {
    hp: 13471,
    hp_: 0.496,
    enerRech_: 1,
    hydroDmg_: 0.288,
    critDMG_: 0.5,
    critRate_: 0.05,
  },
  values: {
    flower: [
      art('f1', 'OceanHuedClam', {
        hp: 4780,
        eleMas: 44,
        hp_: 0.058,
        enerRech_: 0.227,
      }),
      art('f2', 'OceanHuedClam', { hp: 4780, eleMas: 43, hp_: 0.06 }),
      art('f3', 'OceanHuedClam', {
        hp: 4780,
        critDMG_: 0.15,
        critRate_: 0.031,
      }),
    ],
    plume: [
      art('p1', 'OceanHuedClam', { hp: 4780, hp_: 0.163, eleMas: 37 }),
      art('p2', 'OceanHuedClam', {
        hp: 4780,
        hp_: 0.1,
        critRate_: 0.1,
        enerRech_: 0.12,
      }),
      art('p3', 'HeartOfDepth', {
        hp: 4780,
        critDMG_: 0.12,
        eleMas: 40,
        enerRech_: 0.065,
      }),
    ],
    sands: [
      art('s1', 'OceanHuedClam', {
        enerRech_: 0.518,
        hp: 568,
        eleMas: 56,
        hp_: 0.105,
      }),
      art('s2', 'OceanHuedClam', { hp_: 0.466, hp: 538, critRate_: 0.08 }),
      art('s3', 'HeartOfDepth', {
        hp_: 0.466,
        eleMas: 40,
        enerRech_: 0.155,
      }),
    ],
    goblet: [
      art('g1', 'OceanHuedClam', { hydroDmg_: 0.466, hp: 478, eleMas: 35 }),
      art('g2', 'OceanHuedClam', {
        hydroDmg_: 0.466,
        hp_: 0.1,
        critDMG_: 0.1,
      }),
      art('g3', 'HeartOfDepth', {
        hydroDmg_: 0.466,
        critDMG_: 0.124,
        eleMas: 79,
        hp_: 0.099,
      }),
    ],
    circlet: [
      art('c1', 'OceanHuedClam', {
        critRate_: 0.311,
        hp_: 0.198,
        eleMas: 19,
      }),
      art('c2', 'OceanHuedClam', {
        hp_: 0.466,
        critRate_: 0.06,
        enerRech_: 0.15,
      }),
      art('c3', 'OceanHuedClam', {
        critRate_: 0.311,
        hp: 299,
        critDMG_: 0.155,
        eleMas: 56,
      }),
    ],
  },
}

const SUB_ROLL: DynStat = {
  hp_: 0.0583,
  eleMas: 23.31,
  enerRech_: 0.0648,
  critRate_: 0.0389,
  critDMG_: 0.0777,
}
const SUB_POOL: DynMinMax = Object.fromEntries(
  Object.entries(SUB_ROLL).map(([k, r]) => [k, { min: 0, max: 6 * r }])
)
const flowerProfiles: FutureArtifactProfile[] = (
  ['HeartOfDepth', 'OceanHuedClam'] as const
).map((set) => ({
  fixed: { hp: 4780, [set]: 1 },
  substats: SUB_POOL,
  maxSubstats: 4,
  rollBudget: { rollSize: SUB_ROLL, totalRolls: 9 },
}))

function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
function sampleLegal(
  profile: FutureArtifactProfile,
  rng: () => number
): ArtifactBuildData {
  const values: DynStat = { ...profile.fixed }
  const keys = Object.keys(profile.substats)
  const picked: string[] = []
  while (picked.length < 4) {
    const k = keys[Math.floor(rng() * keys.length)]
    if (!picked.includes(k)) picked.push(k)
  }
  let budget = 9
  for (const k of picked) {
    const rolls = Math.min(6, budget) * rng()
    budget -= rolls
    values[k] = rolls * SUB_ROLL[k]
  }
  return { id: 'x', values }
}

/** Drive the worker pipeline the way GOSolver does, single-worker. */
function runSolver(problem: OptProblemInput) {
  const setup: Setup = (GOSolver.prototype.preprocess as any).call(
    undefined,
    problem
  )
  let splitWorker: SplitWorker
  try {
    const w = new BNBSplitWorker(setup, () => {})
    w.minDominanceCount = 0 // exercise dominance pruning on the tiny fixture
    splitWorker = w
  } catch {
    splitWorker = new DefaultSplitWorker(setup, () => {})
  }
  const computeWorker = new ComputeWorker(setup, () => {})
  const root = objKeyMap(allArtifactSlotKeys, () => ({
    kind: 'exclude' as const,
    sets: new Set<ArtifactSetKey>(),
  }))
  for (const filter of splitWorker.split(root, 16)) {
    computeWorker.compute(filter)
    computeWorker.refresh(true)
    splitWorker.setThreshold(computeWorker.threshold)
  }
  computeWorker.refresh(true)
  const candidates = computeWorker.partialCandidates()
  const threshold = computeWorker.builds[0]?.value ?? -Infinity
  const partials =
    candidates &&
    tightenPartialBuilds(
      setup.partialBuilds!,
      mergePartialCandidates([candidates]),
      threshold
    )
  return {
    builds: computeWorker.builds,
    candidates,
    partials,
    threshold,
    usedBNB: splitWorker instanceof BNBSplitWorker,
  }
}

function bruteTopK(nodes: OptNode[], mins: number[], k: number): number[] {
  const compute = precompute(nodes, exampleArts.base, (f) => f.path[1], 5)
  const vals: number[] = []
  for (const build of cartesian(
    ...allArtifactSlotKeys.map((s) => exampleArts.values[s])
  )) {
    const out = compute(build as any)
    if (nodes.every((_, i) => out[i] >= (mins[i] ?? -Infinity)))
      vals.push(out[0])
  }
  return vals.sort((a, b) => b - a).slice(0, k)
}

describe('solver partial builds (plotData-style flow)', () => {
  test('pipeline: candidates accumulate, tighten returns witnessed subset', () => {
    const problem: OptProblemInput = {
      arts: exampleArts,
      optimizationTarget: target,
      constraints: [{ value: er, min: 1.35 }],
      exclusion: {},
      topN: 2,
      partialBuilds: { flower: flowerProfiles },
    }
    const { builds, candidates, partials, threshold, usedBNB } =
      runSolver(problem)
    expect(usedBNB).toBe(true)

    // the solve itself is unaffected by tracking
    const expected = bruteTopK([target, er], [-Infinity, 1.35], 2)
    builds.forEach((b, i) => expect(b.value).toBeCloseTo(expected[i], 9))
    expect(threshold).toBeCloseTo(expected[0], 9)

    const combos = candidates!.flower!
    expect(combos.length).toBeGreaterThan(0)
    const candidateKeys = new Set(combos.map((ids) => ids.join('|')))
    const members = partials!.flower!
    expect(members.length).toBeGreaterThan(0)
    expect(members.length).toBeLessThanOrEqual(combos.length)
    for (const m of members) {
      expect(candidateKeys.has(m.artifactIds.join('|'))).toBe(true)
      expect(m.witness).toBeDefined()
    }

    // witness values are exact, and coverage holds vs the *candidates*
    // (full-product coverage awaits future-aware pruning; see plan 2)
    const nodes = [target, er]
    const mins = [-Infinity, 1.35]
    const compute = precompute(nodes, exampleArts.base, (f) => f.path[1], 5)
    const byId = new Map(
      allArtifactSlotKeys.flatMap((s) =>
        exampleArts.values[s].map((a) => [a.id, a] as const)
      )
    )
    const evalAt = (x: ArtifactBuildData, ids: string[]) => {
      const out = compute([x, ...ids.map((id) => byId.get(id)!)] as any)
      return {
        value: out[0],
        feasible: nodes.every((_, j) => j === 0 || out[j] >= mins[j]),
      }
    }
    for (const m of members) {
      const { artifact, value } = m.witness!
      const own = evalAt({ id: 'w', values: artifact }, m.artifactIds)
      expect(own.feasible).toBe(true)
      expect(own.value).toBeCloseTo(value, 9)
    }
    const rng = makeRng(17)
    for (let i = 0; i < 20; i++) {
      const x = sampleLegal(flowerProfiles[i % 2], rng)
      let best = threshold
      for (const m of members) {
        const r = evalAt(x, m.artifactIds)
        if (r.feasible && r.value > best) best = r.value
      }
      for (const ids of combos) {
        const r = evalAt(x, ids)
        if (r.feasible)
          expect(best).toBeGreaterThanOrEqual(r.value - 1e-9 * r.value)
      }
    }
  })

  test('plotBase and partialBuilds are mutually exclusive', () => {
    const problem: OptProblemInput = {
      arts: exampleArts,
      optimizationTarget: target,
      constraints: [],
      exclusion: {},
      topN: 1,
      plotBase: hp,
      partialBuilds: { flower: flowerProfiles },
    }
    expect(() =>
      (GOSolver.prototype.preprocess as any).call(undefined, problem)
    ).toThrow()
  })

  test('solve without partialBuilds is unaffected', () => {
    const problem: OptProblemInput = {
      arts: exampleArts,
      optimizationTarget: target,
      constraints: [],
      exclusion: {},
      topN: 2,
    }
    const { builds, candidates, partials } = runSolver(problem)
    const expected = bruteTopK([target], [], 2)
    builds.forEach((b, i) => expect(b.value).toBeCloseTo(expected[i], 9))
    expect(candidates).toBeUndefined()
    expect(partials).toBeUndefined()
  })
})
