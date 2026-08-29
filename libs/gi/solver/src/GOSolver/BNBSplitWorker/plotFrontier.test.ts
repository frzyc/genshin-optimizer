import { cartesian, objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import {
  dynRead,
  precompute,
  prod,
  sum,
  threshold,
} from '@genshin-optimizer/gi/wr'
import type { ArtifactsBySlot } from '../../common'
import { countBuilds, filterArts } from '../../common'
import type { Interim } from '../../type'
import { ComputeWorker } from '../ComputeWorker'
import { BNBSplitWorker } from './index'

/**
 * When plotting, the solver must preserve the Pareto frontier of
 * (plotBase, optTarget): a build may only be pruned by the rising opt-target
 * threshold if some top-N build also matches or exceeds its plotBase value.
 * Pruning on the threshold alone truncates the frontier at the extrema
 * (high-plotBase builds legitimately score below the top-N threshold).
 *
 * These tests simulate the GOSolver/ComputeWorker feedback loop around
 * `BNBSplitWorker` with maximally aggressive thresholds, and check that every
 * point of the brute-forced Pareto frontier is still enumerated.
 */

// Note: reads must be accumulating (`dynRead`), NOT `customRead`; pruneAll's
// reaffine constant-folds non-accumulating reads of missing keys to NaN.
const hp = sum(dynRead('hp'), prod(13471, dynRead('hp_')))
const dmg_ = sum(
  1,
  dynRead('hydroDmg_'),
  threshold(dynRead('HeartOfDepth'), 2, 0.2, 0),
  threshold(dynRead('HeartOfDepth'), 4, 0.35, 0)
)
const crcd = sum(1, prod(dynRead('critRate_'), dynRead('critDMG_')))
const er = dynRead('enerRech_')
const target = prod(hp, dmg_, crcd)

const arts: ArtifactsBySlot = {
  base: {
    hp: 13471,
    hp_: 0.496,
    atk: 842,
    enerRech_: 1,
    hydroDmg_: 0.288,
    critDMG_: 0.5,
    critRate_: 0.05,
  },
  values: {
    flower: [
      {
        id: 'f1',
        set: 'OceanHuedClam',
        values: {
          hp: 4780,
          hp_: 0.058,
          atk: 31,
          enerRech_: 0.227,
          OceanHuedClam: 1,
        },
      },
      {
        id: 'f2',
        set: 'OceanHuedClam',
        values: {
          hp: 4780,
          hp_: 0.06,
          atk: 32,
          enerRech_: 0.207,
          OceanHuedClam: 1,
        },
      },
      {
        id: 'f3',
        set: 'HeartOfDepth',
        values: {
          hp: 717,
          critDMG_: 0.054,
          hp_: 0.047,
          critRate_: 0.031,
          HeartOfDepth: 1,
        },
      },
    ],
    plume: [
      {
        id: 'p1',
        set: 'OceanHuedClam',
        values: { atk: 311, hp_: 0.163, hp: 568, OceanHuedClam: 1 },
      },
      {
        id: 'p2',
        set: 'OceanHuedClam',
        values: { atk: 311, hp_: 0.173, hp: 508, OceanHuedClam: 1 },
      },
      {
        id: 'p3',
        set: 'HeartOfDepth',
        values: {
          atk: 311,
          critDMG_: 0.062,
          enerRech_: 0.065,
          atk_: 0.262,
          HeartOfDepth: 1,
        },
      },
    ],
    sands: [
      {
        id: 's1',
        set: 'OceanHuedClam',
        values: {
          enerRech_: 0.518,
          hp: 568,
          atk_: 0.105,
          hp_: 0.105,
          OceanHuedClam: 1,
        },
      },
      {
        id: 's2',
        set: 'OceanHuedClam',
        values: {
          enerRech_: 0.518,
          hp: 538,
          atk_: 0.115,
          hp_: 0.115,
          OceanHuedClam: 1,
        },
      },
      {
        id: 's3',
        set: 'HeartOfDepth',
        values: {
          hp_: 0.466,
          atk_: 0.058,
          atk: 45,
          enerRech_: 0.155,
          HeartOfDepth: 1,
        },
      },
    ],
    goblet: [
      {
        id: 'g1',
        set: 'OceanHuedClam',
        values: { hydroDmg_: 0.466, hp: 478, OceanHuedClam: 1 },
      },
      {
        id: 'g2',
        set: 'OceanHuedClam',
        values: { hydroDmg_: 0.466, hp: 498, OceanHuedClam: 1 },
      },
      {
        id: 'g3',
        set: 'HeartOfDepth',
        values: {
          hydroDmg_: 0.466,
          critDMG_: 0.124,
          hp_: 0.099,
          HeartOfDepth: 1,
        },
      },
    ],
    circlet: [
      {
        id: 'c1',
        set: 'OceanHuedClam',
        values: { heal_: 0.359, critRate_: 0.058, hp_: 0.198, atk: 14 },
      },
      {
        id: 'c2',
        set: 'OceanHuedClam',
        values: { heal_: 0.359, critRate_: 0.063, hp_: 0.178, atk: 15 },
      },
      {
        id: 'c3',
        set: 'HeartOfDepth',
        values: {
          critRate_: 0.311,
          hp: 299,
          critDMG_: 0.155,
          atk_: 0.105,
          HeartOfDepth: 1,
        },
      },
    ],
  },
}
const totalBuilds = countBuilds(arts)
const rootFilter = () =>
  objKeyMap(allArtifactSlotKeys, () => ({
    kind: 'exclude' as const,
    sets: new Set<ArtifactSetKey>(),
  }))

type Pt = { v: number; x: number }
type Constraint = { value: OptNode; min: number }

function enumerate(
  a: ArtifactsBySlot,
  constraints: Constraint[]
): { pts: Pt[]; enumerated: number } {
  const evalNodes = [target, ...constraints.map((c) => c.value), er]
  const compute = precompute(evalNodes, arts.base, (f) => f.path[1], 5)
  const pts: Pt[] = []
  let enumerated = 0
  for (const build of cartesian(
    ...allArtifactSlotKeys.map((s) => a.values[s])
  )) {
    enumerated++
    const out = compute(build as any)
    if (constraints.some((c, ci) => out[1 + ci] < c.min)) continue
    pts.push({ v: out[0], x: out[evalNodes.length - 1] })
  }
  return { pts, enumerated }
}

/** Points not Pareto-dominated: no other point has x' >= x and v' > v */
function paretoFrontier(pts: Pt[]): Pt[] {
  const sorted = [...pts].sort((a, b) => b.x - a.x || b.v - a.v)
  const out: Pt[] = []
  let maxV = Number.NEGATIVE_INFINITY
  for (const p of sorted)
    if (p.v > maxV) {
      out.push(p)
      maxV = p.v
    }
  return out
}

/**
 * Drive `BNBSplitWorker` the way GOSolver + ComputeWorker do, with the most
 * aggressive threshold feedback possible: after every yielded chunk, send the
 * exact current top-N threshold (and, when plotting, the max plotBase among
 * the top-N builds).
 */
function simulate(
  plot: boolean,
  topN: number,
  constraints: Constraint[] = [],
  // Overrides the plotThreshold feedback; `Infinity` reproduces the old,
  // broken behavior (threshold pruning that ignores the plot dimension).
  forcePlotThreshold?: number
) {
  let skipped = 0
  const worker = new BNBSplitWorker(
    {
      command: 'setup',
      arts,
      optTarget: target,
      constraints,
      plotBase: plot ? er : undefined,
      topN,
    },
    (interim: Interim) => (skipped += interim.skipped)
  )
  const found: Pt[] = []
  const top: Pt[] = []
  let enumerated = 0
  for (const yielded of worker.split(rootFilter(), 8)) {
    const chunk = enumerate(filterArts(arts, yielded), constraints)
    enumerated += chunk.enumerated
    found.push(...chunk.pts)
    for (const pt of chunk.pts) {
      top.push(pt)
      top.sort((a, b) => b.v - a.v).splice(topN)
    }
    if (top.length >= topN)
      worker.setThreshold(
        top[topN - 1].v,
        plot
          ? (forcePlotThreshold ?? Math.max(...top.map((p) => p.x)))
          : undefined
      )
  }
  return { found, skipped, enumerated }
}

function key(p: Pt) {
  return `${p.x}|${p.v}`
}

describe.each([1, 2, 5])('plot-aware pruning (topN=%i)', (topN) => {
  test('preserves the full Pareto frontier', () => {
    const { found, skipped, enumerated } = simulate(true, topN)
    const foundKeys = new Set(found.map(key))
    const expected = paretoFrontier(enumerate(arts, []).pts)
    const missing = expected.filter((p) => !foundKeys.has(key(p)))
    expect(missing).toEqual([])
    // Build accounting stays exact: everything is either enumerated or
    // counted as skipped
    expect(enumerated + skipped).toBe(totalBuilds)
  })

  test('still prunes dominated regions', () => {
    const { skipped } = simulate(true, topN)
    expect(skipped).toBeGreaterThan(0)
  })
})

describe('test sensitivity (canary)', () => {
  test('plot-oblivious threshold pruning does clip the frontier', () => {
    // Degenerate the conjunction back to the old behavior: with
    // plotThreshold = Infinity every artifact "fails" the plot test, so
    // pruning falls back to the pure opt-target threshold. The frontier
    // tests above are only meaningful if this actually loses frontier
    // points on this fixture.
    const { found } = simulate(true, 1, [], Number.POSITIVE_INFINITY)
    const foundKeys = new Set(found.map(key))
    const expected = paretoFrontier(enumerate(arts, []).pts)
    const missing = expected.filter((p) => !foundKeys.has(key(p)))
    expect(missing.length).toBeGreaterThan(0)
  })
})

describe('plot-aware pruning with constraints', () => {
  const constraints: Constraint[] = [{ value: hp, min: 24000 }]
  test('preserves the feasible Pareto frontier', () => {
    const { found, skipped, enumerated } = simulate(true, 2, constraints)
    const foundKeys = new Set(found.map(key))
    const expected = paretoFrontier(enumerate(arts, constraints).pts)
    expect(expected.length).toBeGreaterThan(0) // constraint is satisfiable
    const missing = expected.filter((p) => !foundKeys.has(key(p)))
    expect(missing).toEqual([])
    expect(enumerated + skipped).toBe(totalBuilds)
  })
})

describe('non-plot behavior is unchanged', () => {
  test.each([1, 2])('finds the exact top-%i builds', (topN) => {
    const { found, skipped, enumerated } = simulate(false, topN)
    const all = enumerate(arts, []).pts.sort((a, b) => b.v - a.v)
    const foundSorted = found.sort((a, b) => b.v - a.v)
    for (let i = 0; i < topN; i++)
      expect(foundSorted[i].v).toBeCloseTo(all[i].v, 9)
    expect(enumerated + skipped).toBe(totalBuilds)
    expect(skipped).toBeGreaterThan(0)
  })
})

describe('ComputeWorker plot reporting', () => {
  test('buildPlots align with buildValues and match the best builds', () => {
    const interims: Interim[] = []
    const cw = new ComputeWorker(
      {
        command: 'setup',
        arts,
        optTarget: target,
        constraints: [],
        plotBase: er,
        topN: 3,
      },
      (i) => interims.push(i)
    )
    cw.compute(rootFilter())
    cw.refresh(true)

    const reported = interims.filter((i) => i.buildValues)
    expect(reported.length).toBeGreaterThan(0)
    const last = reported[reported.length - 1]
    expect(last.buildPlots).toBeTruthy()
    expect(last.buildPlots!.length).toBe(last.buildValues!.length)

    const all = enumerate(arts, []).pts.sort((a, b) => b.v - a.v)
    expect(last.buildValues![0]).toBeCloseTo(all[0].v, 9)
    expect(last.buildPlots![0]).toBeCloseTo(all[0].x, 9)
  })
})
