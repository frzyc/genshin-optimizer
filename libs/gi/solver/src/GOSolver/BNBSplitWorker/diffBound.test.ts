import { cartesian, objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import {
  dynRead,
  frac,
  max,
  min,
  precompute,
  prod,
  res,
  sum,
  threshold,
} from '@genshin-optimizer/gi/wr'
import type { ArtifactsBySlot } from '../../common'
import { filterArts } from '../../common'
import type { Setup } from '../../type'
import { compileDiffBound, pruneDominance } from './diffBound'
import { BNBSplitWorker } from './index'

/* 90/90 Kokomi with Donut (same fixture as polyUB.test.ts) */
const hp = sum(dynRead('hp'), prod(13471, dynRead('hp_')))
const atk = sum(dynRead('atk'), prod(842, dynRead('atk_')))
const crcd = sum(1, prod(dynRead('critRate_'), dynRead('critDMG_')))
const crcd0 = sum(
  1,
  prod(max(sum(dynRead('critRate_'), -0.3), 0), dynRead('critDMG_'))
)
const dmg_ = sum(
  1,
  dynRead('hydroDmg_'),
  threshold(dynRead('HeartOfDepth'), 2, 0.2, 0),
  threshold(dynRead('HeartOfDepth'), 4, 0.35, 0)
)
const er = dynRead('enerRech_')
const em = prod(2.78, frac(dynRead('eleMas'), 1400))
const ohc = dynRead('OceanHuedClam')
const exampleArts: ArtifactsBySlot = {
  base: {
    hp: 13471,
    hp_: 0.496,
    atk: 842,
    def: 657,
    enerRech_: 1,
    hydroDmg_: 0.288,
    critDMG_: 0.5,
    critRate_: 0.05,
    zc1: -1,
    zc2: -10,
    zc3: -0.44,
    zc4: -1,
  },
  values: {
    flower: [
      {
        id: 'f1',
        set: 'OceanHuedClam',
        values: {
          hp: 4780,
          eleMas: 44,
          hp_: 0.058,
          atk: 31,
          enerRech_: 0.227,
          OceanHuedClam: 1,
          zc1: 1,
        },
      },
      {
        id: 'f2',
        set: 'OceanHuedClam',
        values: {
          hp: 4780,
          eleMas: 43,
          hp_: 0.06,
          atk: 32,
          enerRech_: 0.207,
          OceanHuedClam: 1,
          zc2: 10,
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
          def_: 0.066,
          HeartOfDepth: 1,
          zc3: 2,
        },
      },
    ],
    plume: [
      {
        id: 'p1',
        set: 'OceanHuedClam',
        values: {
          atk: 311,
          hp_: 0.163,
          def: 37,
          eleMas: 37,
          hp: 568,
          OceanHuedClam: 1,
          zc4: -0.002,
        },
      },
      {
        id: 'p2',
        set: 'OceanHuedClam',
        values: {
          atk: 311,
          hp_: 0.173,
          def: 35,
          eleMas: 39,
          hp: 508,
          OceanHuedClam: 1,
          zc4: -0.0005,
        },
      },
      {
        id: 'p3',
        set: 'HeartOfDepth',
        values: {
          atk: 311,
          critDMG_: 0.062,
          enerRech_: 0.065,
          eleMas: 40,
          atk_: 0.262,
          HeartOfDepth: 1,
          zc4: 0.002,
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
          eleMas: 56,
          hp_: 0.105,
          OceanHuedClam: 1,
          zc2: 22,
        },
      },
      {
        id: 's2',
        set: 'OceanHuedClam',
        values: {
          enerRech_: 0.518,
          hp: 538,
          atk_: 0.115,
          eleMas: 52,
          hp_: 0.115,
          OceanHuedClam: 1,
          zc2: 21.95,
        },
      },
      {
        id: 's3',
        set: 'HeartOfDepth',
        values: {
          hp_: 0.466,
          atk_: 0.058,
          eleMas: 40,
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
        values: {
          hydroDmg_: 0.466,
          hp: 478,
          def_: 0.204,
          def: 23,
          eleMas: 35,
          OceanHuedClam: 1,
        },
      },
      {
        id: 'g2',
        set: 'OceanHuedClam',
        values: {
          hydroDmg_: 0.466,
          hp: 498,
          def_: 0.194,
          def: 28,
          eleMas: 31,
          OceanHuedClam: 1,
        },
      },
      {
        id: 'g3',
        set: 'HeartOfDepth',
        values: {
          hydroDmg_: 0.466,
          critDMG_: 0.124,
          eleMas: 79,
          def: 23,
          hp_: 0.099,
          HeartOfDepth: 1,
        },
      },
    ],
    circlet: [
      {
        id: 'c1',
        set: 'OceanHuedClam',
        values: {
          heal_: 0.359,
          critRate_: 0.058,
          hp_: 0.198,
          atk: 14,
          eleMas: 19,
        },
      },
      {
        id: 'c2',
        set: 'OceanHuedClam',
        values: {
          heal_: 0.359,
          critRate_: 0.063,
          hp_: 0.178,
          atk: 15,
          eleMas: 18,
          zc1: 2,
        },
      },
      {
        id: 'c3',
        set: 'HeartOfDepth',
        values: {
          critRate_: 0.311,
          hp: 299,
          critDMG_: 0.155,
          atk_: 0.105,
          eleMas: 56,
          zc1: 2,
        },
      },
    ],
  },
}

/**
 * Brute-force check: for every same-slot pair (m, n) and every choice of
 * artifacts r in the other slots, the true difference f(n + r) - f(m + r)
 * must lie within the computed interval, for every node.
 */
function checkDiffBounds(nodes: OptNode[], arts: ArtifactsBySlot) {
  const bound = compileDiffBound(nodes, arts)
  const compute = precompute(nodes, arts.base, (f) => f.path[1], 5)
  const violations: string[] = []
  for (const slot of allArtifactSlotKeys) {
    const others = allArtifactSlotKeys.filter((s) => s !== slot)
    const rests = cartesian(...others.map((s) => arts.values[s]))
    const list = arts.values[slot]
    const slotBound = bound.forSlot(slot)
    const ctxs = list.map((art) => slotBound.context(bound.toVector(art)))
    list.forEach((m, mi) =>
      list.forEach((n, ni) => {
        const out = slotBound.evaluate(ctxs[mi], ctxs[ni])
        const lo = [...out.lo],
          hi = [...out.hi] // copy; buffers are reused
        for (const rest of rests) {
          const fm = compute([m, ...rest] as any)
          const fn = compute([n, ...rest] as any)
          nodes.forEach((_, i) => {
            const d = fn[i] - fm[i]
            const eps = 1e-9 * Math.max(1, Math.abs(lo[i]), Math.abs(hi[i]))
            if (d < lo[i] - eps || d > hi[i] + eps)
              violations.push(
                `node ${i}, ${slot} ${m.id}->${n.id}: diff ${d} outside [${lo[i]}, ${hi[i]}]`
              )
          })
        }
      })
    )
  }
  expect(violations).toEqual([])
}

describe('compileDiffBound soundness (brute force)', () => {
  test('linear nodes', () => checkDiffBounds([hp, atk], exampleArts))
  test('products', () =>
    checkDiffBounds([prod(hp, atk), prod(-1, hp, atk)], exampleArts))
  test('min/max', () =>
    checkDiffBounds([min(atk, 1400), max(atk, 1400)], exampleArts))
  test('res', () =>
    checkDiffBounds(
      [res(sum(er, -1.5)), res(sum(er, -2.2)), res(sum(er, 0.1))],
      exampleArts
    ))
  test('sum_frac', () => checkDiffBounds([em], exampleArts))
  test('threshold (const branches)', () =>
    checkDiffBounds(
      [
        threshold(ohc, 2, 1, 0),
        threshold(ohc, 2, 0, 1),
        threshold(ohc, 4, 0.35, 0),
        // resolved thresholds (always pass / always fail)
        threshold(ohc, 0, 1, 0),
        threshold(ohc, 10, 1, 0),
      ],
      exampleArts
    ))
  test('threshold (non-const pass)', () =>
    checkDiffBounds([threshold(ohc, 2, hp, 0)], exampleArts))
  test('composite formulas', () =>
    checkDiffBounds(
      [prod(atk, dmg_, crcd0), prod(atk, dmg_, crcd, em), prod(hp, dmg_, em)],
      exampleArts
    ))
  test('zero-crossing products', () => {
    const z1 = dynRead('zc1'),
      z2 = dynRead('zc2'),
      z3 = dynRead('zc3'),
      z4 = dynRead('zc4')
    checkDiffBounds(
      [prod(z1, z2, z3, z4), sum(prod(z1, z2), prod(-0.3, z3, z4), z2)],
      exampleArts
    )
  })
})

describe('pruneDominance', () => {
  test('removes strictly dominated artifacts', () => {
    // Under pure HP, f2 (hp 4780, hp_ .06, ohc) strictly dominates f1
    // (hp 4780, hp_ .058, ohc) and f3 (hp 717, hp_ .047, hod).
    const { arts, dominators } = pruneDominance([hp], exampleArts, 1)
    expect(arts.values.flower.map((a) => a.id)).toEqual(['f2'])
    expect(dominators.get('f1')).toEqual(['f2'])
    expect(dominators.get('f3')).toBeTruthy()
  })

  test('keeps mutually incomparable artifacts', () => {
    // With a target that trades off multiple stats and set bonuses, the
    // sets-differ pairs cannot dominate (set-count reads block it).
    const target = prod(atk, dmg_, crcd, em)
    const { arts } = pruneDominance([target], exampleArts, 1)
    // f3 (HeartOfDepth, crit stats) must survive: it is the only flower
    // that can hold HoD set counts and crit stats.
    expect(arts.values.flower.some((a) => a.id === 'f3')).toBe(true)
  })

  /**
   * The top-k feasible build values must be identical before and after
   * pruning with numTop = k.
   */
  function bruteTopK(
    nodes: OptNode[],
    mins: number[],
    arts: ArtifactsBySlot,
    k: number
  ): number[] {
    const compute = precompute(nodes, arts.base, (f) => f.path[1], 5)
    const vals: number[] = []
    for (const build of cartesian(
      ...allArtifactSlotKeys.map((s) => arts.values[s])
    )) {
      const out = compute(build as any)
      if (nodes.every((_, i) => out[i] >= (mins[i] ?? -Infinity)))
        vals.push(out[0])
    }
    return vals.sort((a, b) => b - a).slice(0, k)
  }

  test.each([1, 2, 3])(
    'preserves top-%i feasible builds under constraints',
    (k) => {
      const target = prod(atk, dmg_, crcd, em)
      const nodes = [target, er]
      const mins = [-Infinity, 1.35]
      const before = bruteTopK(nodes, mins, exampleArts, k)
      const { arts } = pruneDominance(nodes, exampleArts, k)
      const after = bruteTopK(nodes, mins, arts, k)
      expect(after.length).toBe(before.length)
      after.forEach((v, i) => expect(v).toBeCloseTo(before[i], 9))
    }
  )

  test.each([1, 2])('preserves top-%i without constraints', (k) => {
    const target = prod(hp, dmg_, crcd, em)
    const before = bruteTopK([target], [], exampleArts, k)
    const { arts } = pruneDominance([target], exampleArts, k)
    const after = bruteTopK([target], [], arts, k)
    expect(after.length).toBe(before.length)
    after.forEach((v, i) => expect(v).toBeCloseTo(before[i], 9))
  })

  test('candidate cap only reduces removals, never breaks top-k', () => {
    const target = prod(atk, dmg_, crcd, em)
    const uncapped = pruneDominance([target], exampleArts, 1)
    const capped = pruneDominance([target], exampleArts, 1, 1)
    allArtifactSlotKeys.forEach((slot) =>
      expect(capped.arts.values[slot].length).toBeGreaterThanOrEqual(
        uncapped.arts.values[slot].length
      )
    )
    const before = bruteTopK([target], [], exampleArts, 1)
    const after = bruteTopK([target], [], capped.arts, 1)
    expect(after[0]).toBeCloseTo(before[0], 9)
  })
})

describe('BNBSplitWorker end-to-end with dominance pruning', () => {
  test('yielded filters still contain the top-N feasible builds', () => {
    const target = prod(atk, dmg_, crcd, em)
    const nodes = [target, er]
    const mins = [-Infinity, 1.35]
    const topN = 2
    const setup: Setup = {
      command: 'setup',
      arts: exampleArts,
      optTarget: target,
      constraints: [{ value: er, min: 1.35 }],
      plotBase: undefined,
      topN,
    }
    const worker = new BNBSplitWorker(setup, () => {})
    worker.minDominanceCount = 0 // exercise dominance despite the tiny fixture
    const root = objKeyMap(allArtifactSlotKeys, () => ({
      kind: 'exclude' as const,
      sets: new Set<ArtifactSetKey>(),
    }))

    const compute = precompute(nodes, exampleArts.base, (f) => f.path[1], 5)
    const vals: number[] = []
    for (const yielded of worker.split(root, 16)) {
      const fa = filterArts(exampleArts, yielded)
      for (const build of cartesian(
        ...allArtifactSlotKeys.map((s) => fa.values[s])
      )) {
        const out = compute(build as any)
        if (out[1] >= mins[1]) vals.push(out[0])
      }
    }
    const top = vals.sort((a, b) => b - a).slice(0, topN)
    const expected = bruteTopKStandalone(nodes, mins, exampleArts, topN)
    expect(top.length).toBe(expected.length)
    top.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 9))
  })

  function bruteTopKStandalone(
    nodes: OptNode[],
    mins: number[],
    arts: ArtifactsBySlot,
    k: number
  ): number[] {
    const compute = precompute(nodes, arts.base, (f) => f.path[1], 5)
    const vals: number[] = []
    for (const build of cartesian(
      ...allArtifactSlotKeys.map((s) => arts.values[s])
    )) {
      const out = compute(build as any)
      if (nodes.every((_, i) => out[i] >= (mins[i] ?? -Infinity)))
        vals.push(out[0])
    }
    return vals.sort((a, b) => b - a).slice(0, k)
  }
})
