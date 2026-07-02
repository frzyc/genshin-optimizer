import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { allSubstatKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { getMainStatValue, getSubstatValue } from '@genshin-optimizer/gi/util'
import { dynRead, prod, sum } from '@genshin-optimizer/gi/wr'

import { substatWeights } from './consts'
import { deduplicate } from './deduplicate'
import { expandRollsLevel } from './expandRolls'
import {
  expandSubstatLevel,
  makeRollsNode,
  makeSubstatNode,
} from './expandSubstat'
import { evalMarkovNode, evaluateGaussian } from './markov-tree/evaluation'
import { makeObjective } from './markov-tree/makeObjective'
import type { GaussianNode, Objective } from './markov-tree/markov.types'
import { rollCountMuVar } from './markov-tree/mathUtil'
import { crawlSubstats } from './substatProbs'
import { lvl0, lvl0_2, lvl20 } from './testArtifacts.json'
import {
  dustReshape,
  elixirDefinition,
  expandNode,
  expandNodes,
  levelUpArtifact,
} from './upOpt'
import type { MarkovNode, SubstatLevelNode } from './upOpt.types'

const emptyBuild = {
  flower: undefined,
  plume: undefined,
  sands: undefined,
  goblet: undefined,
  circlet: undefined,
}

/**
 * Checks whether the expanded nodes' evaluations match the base Gaussian node's evaluation.
 * Should only work for linear objectives.
 *
 * This function essentially checks that the Gaussian Mixture Model (GMM) formed by the expanded nodes
 * has the same mean and variance as the original Gaussian node.
 *
 * @param obj Linear(!) objective function
 * @param expanded Weighted list of expanded nodes (GMM distribution)
 * @param g Base Gaussian node
 */
function checkExpandedEvalCorrectness(
  obj: Objective,
  expanded: { p: number; n: MarkovNode }[],
  g: GaussianNode
) {
  // Check probabilities sum to 1
  expect(expanded.reduce((_, { p }) => _ + p, 0)).toBeCloseTo(1)
  const expanded2 = expanded.map(({ p, n }) => {
    const emn = evalMarkovNode(obj, n)
    return {
      p,
      mu: emn.evaluation.f_mu[0],
      sig2: emn.evaluation.f_cov[0][0],
    }
  })
  const mean = expanded2.reduce((a, { p, mu }) => a + p * mu, 0)
  const sig2 = expanded2.reduce(
    (a, { p, mu, sig2 }) => a + p * (sig2 + mu ** 2),
    -(mean ** 2)
  )

  // Check means and variances match
  const baseEval = evaluateGaussian(obj, g)
  expect(mean).toBeCloseTo(baseEval.f_mu[0])
  expect(sig2).toBeCloseTo(baseEval.f_cov[0][0])
}

describe('upOpt components', () => {
  const nodeLinear = sum(dynRead('atk'), prod(1500, dynRead('atk_')))
  const nodeNonlinear = prod(nodeLinear, dynRead('critRate_'))

  test('makeObjective', () => {
    const obj = makeObjective([nodeLinear, nodeNonlinear], [4000, 100])
    expect(obj.threshold).toEqual([4000, 100])

    const [f, df] = obj.computeWithDerivs({
      atk: 100,
      atk_: 0.5,
      critRate_: 0.7,
    })
    // f0 = atk + 1500 * atk_ = 100 + 1500 * 0.5
    // f1 = (atk + 1500 * atk_) * critRate_ = (100 + 1500 * 0.5) * 0.7
    expect(f[0]).toBeCloseTo(100 + 1500 * 0.5)
    expect(f[1]).toBeCloseTo((100 + 1500 * 0.5) * 0.7)

    // Jf0 = [1, 1500, 0]
    // Jf1 = [critRate_, 1500 * critRate_, atk + 1500 * atk_]
    expect(df[0]['atk']).toBeCloseTo(1)
    expect(df[0]['atk_']).toBeCloseTo(1500)
    expect(df[1]['atk']).toBeCloseTo(0.7)
    expect(df[1]['atk_']).toBeCloseTo(1500 * 0.7)
    expect(df[1]['critRate_']).toBeCloseTo(100 + 1500 * 0.5)
  })

  test('evaluateGaussianDegen', () => {
    const obj = makeObjective([nodeLinear, nodeNonlinear], [4000, 100])
    const gnode: GaussianNode = {
      base: { atk: 100, atk_: 1.5, critRate_: 1.0 },
      subs: [],
      mu: [],
      cov: [[]],
    }
    const { f_mu, f_cov, prob, constr_prob, upAvg } = evaluateGaussian(
      obj,
      gnode
    )
    expect(f_mu[0]).toBeCloseTo(100 + 1500 * 1.5)
    expect(f_mu[1]).toBeCloseTo((100 + 1500 * 1.5) * 1.0)
    expect(f_cov).toStrictEqual([
      [0, 0],
      [0, 0],
    ])
    expect(prob).toBeCloseTo(0)
    expect(constr_prob).toBeCloseTo(1)
    expect(upAvg).toBeCloseTo(0)
  })

  test('evaluateGaussianDegen2', () => {
    const obj2 = makeObjective([nodeLinear, nodeNonlinear], [2000, 100])
    const gnode: GaussianNode = {
      base: { atk: 100, atk_: 1.5, critRate_: 1.0 },
      subs: [],
      mu: [],
      cov: [[]],
    }
    const { f_mu, f_cov, prob, constr_prob, upAvg } = evaluateGaussian(
      obj2,
      gnode
    )
    expect(f_mu[0]).toBeCloseTo(100 + 1500 * 1.5)
    expect(f_mu[1]).toBeCloseTo((100 + 1500 * 1.5) * 1.0)
    expect(f_cov).toStrictEqual([
      [0, 0],
      [0, 0],
    ])
    expect(prob).toBeCloseTo(1)
    expect(constr_prob).toBeCloseTo(1)
    expect(upAvg).toBeCloseTo(100 + 1500 * 1.5 - 2000)
  })

  // TEST evaluateGaussian:
  // Checks whether the Gaussian evaluation (propagation through nonlinear functions)
  // and probability calculations are correct.
  // The expected values are precomputed using Mathematica for accuracy.
  test('evaluateGaussian', () => {
    const obj = makeObjective([nodeLinear, nodeNonlinear], [4000, 100])
    const gnode: GaussianNode = {
      base: { atk: 100, atk_: 1.5, critRate_: 1.0 },
      subs: ['atk', 'atk_', 'critRate_'],
      mu: [10, 0.5, 0.1],
      cov: [
        [4, 0, 0],
        [0, 0.25, 0],
        [0, 0, 0.01],
      ],
    }
    const { f_mu, f_cov, prob, constr_prob, upAvg } = evaluateGaussian(
      obj,
      gnode
    )
    // f_mu = [atk + 1500 * atk_, (atk + 1500 * atk_) * critRate_]
    expect(f_mu[0]).toBeCloseTo(110 + 1500 * 2.0)
    expect(f_mu[1]).toBeCloseTo((110 + 1500 * 2.0) * 1.1)

    const Jf = [
      [1, 1500, 0],
      [1.1, 1500 * 1.1, 110 + 1500 * 2.0],
    ]
    // f_cov = Jf @ cov @ Jf^T
    expect(f_cov[0][0]).toBeCloseTo(
      4 * Jf[0][0] ** 2 + 0.25 * Jf[0][1] ** 2 + 0.01 * Jf[0][2] ** 2
    )
    expect(f_cov[1][1]).toBeCloseTo(
      4 * Jf[1][0] ** 2 + 0.25 * Jf[1][1] ** 2 + 0.01 * Jf[1][2] ** 2
    )
    expect(f_cov[0][1]).toBeCloseTo(
      4 * Jf[0][0] * Jf[1][0] +
        0.25 * Jf[0][1] * Jf[1][1] +
        0.01 * Jf[0][2] * Jf[1][2]
    )
    expect(f_cov[1][0]).toBeCloseTo(f_cov[0][1])

    // Thresholds are [4000, 100], so constr_prob = P[X1 > 100] ~ 1
    // prob ~ P[X0 > 4000], where X0 ~ N(3110, 562504) (numbers from Mathematica)
    expect(prob).toBeCloseTo(0.11768039653389202)
    expect(constr_prob).toBeCloseTo(0.9999172882229448)

    // upAvg = E[X0 - 4000 | X0 > 4000] ~ 367.45 (number from Mathematica)
    expect(upAvg).toBeCloseTo(367.4450206921483)
  })

  test('expandSubstatReshape', () => {
    const subNode: SubstatLevelNode = {
      type: 'substat',
      base: { atk: 100, atk_: 0, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: 'atk', baseRolls: 0 },
        { key: 'atk_', baseRolls: 0 },
        { key: 'critRate_', baseRolls: 0 },
        { key: 'def', baseRolls: 0 },
      ],
      rollsLeft: 4,
      reshape: { affixes: ['atk_', 'critRate_'], mintotal: 2 },
    } as any as SubstatLevelNode

    const expanded = expandSubstatLevel(subNode)
    const precomputed = [
      { p: 0.00390625, subs: [0, 4, 0, 0] },
      { p: 0.00390625, subs: [0, 0, 4, 0] },
      { p: 0.015625, subs: [0, 1, 3, 0] },
      { p: 0.0234375, subs: [0, 2, 2, 0] },
      { p: 0.015625, subs: [0, 0, 3, 1] },
      { p: 0.046875, subs: [1, 2, 1, 0] },
      { p: 0.0859375, subs: [1, 2, 0, 1] },
      { p: 0.04296875, subs: [0, 0, 2, 2] },
      { p: 0.171875, subs: [1, 1, 1, 1] },
      { p: 0.0859375, subs: [0, 1, 1, 2] },
    ]

    expect(expanded.reduce((a, { p }) => a + p, 0)).toBeCloseTo(1)
    precomputed.forEach(({ p, subs }) => {
      expect(
        expanded.filter(({ n }) =>
          subs.every((v, i) => n.subs[i].rolls === v)
        )[0]!.p
      ).toBeCloseTo(p)
    })
  })

  test('expandrolls', () => {
    const rollsNode = makeRollsNode(
      {
        base: { atk: 100, atk_: 0, critRate_: 0 },
        rarity: 5,
      } as any as SubstatLevelNode,
      [
        { key: 'atk' as const, rolls: 2 },
        { key: 'atk_' as const, rolls: 1 },
        { key: 'critRate_' as const, rolls: 1 },
      ]
    )
    const expanded = expandRollsLevel(rollsNode)

    const obj1 = makeObjective([nodeLinear], [4000])
    checkExpandedEvalCorrectness(obj1, expanded, rollsNode.subDistr)

    const obj2 = makeObjective([dynRead('atk')], [0])
    checkExpandedEvalCorrectness(obj2, expanded, rollsNode.subDistr)

    const obj3 = makeObjective([dynRead('atk_')], [0.1])
    checkExpandedEvalCorrectness(obj3, expanded, rollsNode.subDistr)

    const obj4 = makeObjective([dynRead('critRate_')], [0.1])
    checkExpandedEvalCorrectness(obj4, expanded, rollsNode.subDistr)
    checkExpandedEvalCorrectness(
      obj4,
      deduplicate(obj4, expanded),
      rollsNode.subDistr
    )
  })

  test('expandSubstat', () => {
    const n = makeSubstatNode({
      base: { atk: 100, atk_: 0.5, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: 'atk', baseRolls: 0 },
        { key: 'atk_', baseRolls: 0 },
        { key: 'critRate_', baseRolls: 0 },
        { key: 'def', baseRolls: 0 },
      ],
      rollsLeft: 5,
    })
    const expanded = expandSubstatLevel(n)

    const obj = makeObjective([nodeLinear], [4000])
    checkExpandedEvalCorrectness(obj, expanded, n.subDistr)
    checkExpandedEvalCorrectness(obj, deduplicate(obj, expanded), n.subDistr)
  })

  test('expandSubstatFancy', () => {
    const n = makeSubstatNode({
      base: { atk: 100, atk_: 0.5, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: 'atk', baseRolls: 2 },
        { key: 'atk_', baseRolls: 0 },
        { key: 'critRate_', baseRolls: 3 },
        { key: 'def', baseRolls: 0 },
      ],
      rollsLeft: 5,
      reshape: { affixes: ['atk_', 'critRate_'], mintotal: 2 },
    })
    const expanded = expandSubstatLevel(n)

    const obj = makeObjective([nodeLinear], [4000])
    checkExpandedEvalCorrectness(obj, expanded, n.subDistr)
    checkExpandedEvalCorrectness(obj, deduplicate(obj, expanded), n.subDistr)
  })

  test('expandSubstatFancy MissingSubs', () => {
    const n = makeSubstatNode({
      base: { atk: 100, atk_: 0.5, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: 'atk', baseRolls: 2 },
        { key: 'atk_', baseRolls: 0 },
      ],
      rollsLeft: 5,
      reshape: { affixes: ['atk_', 'critRate_'], mintotal: 2 },
    })
    const expanded = expandSubstatLevel(n)

    const obj = makeObjective([nodeLinear], [4000])
    checkExpandedEvalCorrectness(obj, expanded, n.subDistr)
    checkExpandedEvalCorrectness(obj, deduplicate(obj, expanded), n.subDistr)
  })

  test('deduplicate simplify', () => {
    const n = makeSubstatNode({
      base: { atk: 100, atk_: 0.5, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: 'atk_', baseRolls: 0 },
        { key: 'atk', baseRolls: 2 },
        { key: 'def', baseRolls: 0 },
        { key: 'critRate_', baseRolls: 3 },
      ],
      rollsLeft: 5,
      reshape: { affixes: ['atk', 'critRate_'], mintotal: 2 },
    })
    const expanded = expandSubstatLevel(n)

    const obj = makeObjective([dynRead('def')], [4000])
    checkExpandedEvalCorrectness(obj, expanded, n.subDistr)
    checkExpandedEvalCorrectness(obj, deduplicate(obj, expanded), n.subDistr)
  })

  test('deduplicate substatNode', () => {
    const info = {
      base: { atk: 100, atk_: 0.5, critRate_: 0 },
      rarity: 5 as const,
      rollsLeft: 5,
    }
    const subkeys1 = ['atk', 'atk_', 'critRate_', 'critDMG_'].map((k) => ({
      key: k as SubstatKey,
      baseRolls: 0,
    }))
    const subkeys2 = ['atk', 'atk_', 'critRate_', 'def'].map((k) => ({
      key: k as SubstatKey,
      baseRolls: 0,
    }))
    const expanded = [
      { p: 0.5, n: makeSubstatNode({ ...info, subkeys: subkeys1 }) },
      { p: 0.5, n: makeSubstatNode({ ...info, subkeys: subkeys2 }) },
    ]

    const obj = makeObjective([nodeLinear], [4000])
    const dedup = deduplicate(obj, expanded)
    expect(dedup.length).toBe(1)
  })

  test('expand post dedup', () => {
    const substatNode = makeSubstatNode({
      base: { atk: 100, atk_: 0.5, critRate_: 0 },
      rarity: 5,
      subkeys: [
        { key: 'atk', baseRolls: 0 },
        { key: 'atk_', baseRolls: 0 },
        { key: 'critRate_', baseRolls: 0 },
        { key: 'def', baseRolls: 0 },
      ],
      rollsLeft: 5,
    })

    const obj = makeObjective([nodeLinear], [4000])
    const rollsLevel = deduplicate(obj, expandSubstatLevel(substatNode))
    checkExpandedEvalCorrectness(obj, rollsLevel, substatNode.subDistr)
    const valuesLevel = rollsLevel.flatMap(({ p, n: ni }) =>
      deduplicate(obj, expandNode(ni)).map(({ p: p2, n }) => ({
        p: p * p2,
        n,
      }))
    )
    checkExpandedEvalCorrectness(obj, valuesLevel, substatNode.subDistr)
    checkExpandedEvalCorrectness(
      obj,
      deduplicate(obj, valuesLevel),
      substatNode.subDistr
    )
  })

  test('substatProbs 4th sub', () => {
    const prefix = ['atk', 'def', 'eleMas'] as SubstatKey[]
    const filtered = allSubstatKeys.filter((k) => !prefix.includes(k))
    const denom = filtered
      .map((k) => substatWeights[k])
      .reduce((a, b) => a + b, 0)
    const prob4th = crawlSubstats(prefix, filtered, false)
    expect(prob4th.reduce((a, { p }) => a + p, 0)).toBeCloseTo(1)
    prob4th.forEach(({ p, subs }) => {
      const w = subs.reduce((a, k) => a + substatWeights[k], 0)
      expect(p).toBeCloseTo(w / denom)
    })
  })

  test('substatProbs all 4', () => {
    const filtered = allSubstatKeys.filter((k) => k !== 'hp')
    const res = crawlSubstats([], filtered)
    const expected = [
      { p: 1724981913 / 140744203600, subs: ['critDMG_', 'def', 'atk', 'hp_'] },
      { p: 15233623 / 2090714400, subs: ['critDMG_', 'eleMas', 'atk', 'def_'] },
      { p: 3427272 / 660607675, subs: ['critRate_', 'critDMG_', 'atk', 'hp_'] },
      { p: 222877 / 12932920, subs: ['def', 'enerRech_', 'atk', 'eleMas'] },
      { p: 80433 / 9225944, subs: ['critRate_', 'def', 'critDMG_', 'atk'] },
      { p: 2407 / 235144, subs: ['def', 'hp_', 'eleMas', 'enerRech_'] },
      { p: 128 / 20995, subs: ['hp_', 'eleMas', 'atk_', 'enerRech_'] },
    ]

    expected.forEach(({ p, subs }) => {
      const p2 = res.filter((r) => r.subs.every((s) => subs.includes(s)))[0].p
      expect(p2).toBeCloseTo(p)
    })
  })

  test('substatProbs manual', () => {
    const keys = ['atk', 'def', 'atk_', 'hp_', 'critDMG_'] as const
    const res = crawlSubstats(['enerRech_', 'critRate_'], keys, false)
    // denom = 6 + 6 + 4 + 4 + 3 = 23
    const expected = [
      { p: 6 * 6 * (1 / 23 / 17 + 1 / 23 / 17), subs: ['atk', 'def'] },
      { p: 6 * 4 * (1 / 23 / 17 + 1 / 23 / 19), subs: ['atk', 'atk_'] },
      { p: 4 * 4 * (1 / 23 / 19 + 1 / 23 / 19), subs: ['hp_', 'atk_'] },
      { p: 4 * 3 * (1 / 23 / 19 + 1 / 23 / 20), subs: ['hp_', 'critDMG_'] },
    ]
    expected.forEach(({ p, subs }) => {
      const p2 = res.filter((r) => r.subs.every((s) => subs.includes(s)))[0].p
      expect(p2).toBeCloseTo(p)
    })
  })
})

describe('upOpt makeSubstatNode(s)', () => {
  const nodeAtk = sum(dynRead('atk'), prod(1000, dynRead('atk_')))
  const nodeHp = sum(dynRead('hp'), prod(1000, dynRead('hp_')))
  const nodeCR = sum(dynRead('critRate_'))

  const obj = makeObjective([nodeAtk], [0])
  const obj2 = makeObjective([nodeHp], [0])
  const obj3 = makeObjective([nodeCR], [0])

  const vatk = getSubstatValue('atk', 5, 'max', false)
  const vatk_ = getSubstatValue('atk_', 5, 'max', false)
  const vcr_ = getSubstatValue('critRate_', 5, 'max', false)

  // Given `n` total rolls, return E[rolls] for the guaranteed 2.
  // E[rolls] for the 3rd & 4th = n/2 - E[guaranteed]
  const reshapeStats = {
    2: 1,
    3: 17 / 16,
    4: 19 / 16,
    5: 87 / 64,
    6: 25 / 16,
  }

  describe('levelArtifact', () => {
    test('levelup (flat) unactivated', () => {
      const substatLevel = levelUpArtifact(lvl0 as ICachedArtifact, emptyBuild)
      const rollsLevel = expandNodes(substatLevel)
      const valuesLevel = expandNodes(rollsLevel)
      const g = substatLevel[0].n.subDistr

      checkExpandedEvalCorrectness(obj, rollsLevel, g)
      checkExpandedEvalCorrectness(obj, valuesLevel, g)
      checkExpandedEvalCorrectness(obj2, rollsLevel, g)
      checkExpandedEvalCorrectness(obj2, valuesLevel, g)
      checkExpandedEvalCorrectness(obj3, rollsLevel, g)
      checkExpandedEvalCorrectness(obj3, valuesLevel, g)

      // avg rolls = 1.85 in each stat, so expected atk = 1.85*atk + 1.85*atk_*1000
      const ev = evaluateGaussian(obj, g)
      expect(ev.f_mu[0]).toBeCloseTo(1.85 * vatk + 1.85 * vatk_ * 1000)

      // hp = 4780, no hp rolls.
      const ev2 = evaluateGaussian(obj2, g)
      expect(ev2.f_mu[0]).toBeCloseTo(getMainStatValue('hp', 5, 20))
      expect(ev2.f_cov[0][0]).toBeCloseTo(0)

      // crit rate = [1 (base) + 0.85 (avg roll) * 1 (4 rolls * 1/4 chance each)] * .03889 (base crit rate)
      const ev3 = evaluateGaussian(obj3, g)
      expect(ev3.f_mu[0]).toBeCloseTo(1.85 * vcr_, 5)
    })
    test('levelup (decimal) unactivated', () => {
      const substatLevel = levelUpArtifact(
        lvl0_2 as ICachedArtifact,
        emptyBuild
      )
      const rollsLevel = expandNodes(substatLevel)
      const valuesLevel = expandNodes(rollsLevel)
      const g = substatLevel[0].n.subDistr

      checkExpandedEvalCorrectness(obj, rollsLevel, g)
      checkExpandedEvalCorrectness(obj, valuesLevel, g)
      checkExpandedEvalCorrectness(obj2, rollsLevel, g)
      checkExpandedEvalCorrectness(obj2, valuesLevel, g)
      checkExpandedEvalCorrectness(obj3, rollsLevel, g)
      checkExpandedEvalCorrectness(obj3, valuesLevel, g)

      // avg rolls = 1.85 in each stat, so expected atk = 1.85*atk + 1.85*atk_*1000
      const ev = evaluateGaussian(obj, g)
      expect(ev.f_mu[0]).toBeCloseTo(1.85 * vatk + 1.85 * vatk_ * 1000)

      // hp = 4780, no hp rolls.
      const ev2 = evaluateGaussian(obj2, g)
      expect(ev2.f_mu[0]).toBeCloseTo(getMainStatValue('hp', 5, 20))
      expect(ev2.f_cov[0][0]).toBeCloseTo(0)

      // crit rate = [1 (base) + 0.85 (avg roll) * 1 (4 rolls * 1/4 chance each)] * .03889 (base crit rate)
      const ev3 = evaluateGaussian(obj3, g)
      expect(ev3.f_mu[0]).toBeCloseTo(1.85 * vcr_, 5)
    })
    test('levelup 3line guess 4th', () => {
      const lvl0_3line = structuredClone(lvl0) as ICachedArtifact
      lvl0_3line.unactivatedSubstats = []
      // atk%, critRate%, critDMG% populated, check 4th substat choices.

      const substatLevel = levelUpArtifact(lvl0_3line, emptyBuild)
      const validKeys = ['hp_', 'atk', 'def', 'def_', 'eleMas', 'enerRech_']
      expect(validKeys.length).toEqual(substatLevel.length)

      validKeys.forEach((k) => {
        expect(
          substatLevel.some(({ n }) => n.subkeys.some((s) => s.key === k))
        ).toBeTruthy()
      })
    })
  })
  test('fresh/domain/strongbox', () => {})
  describe('reshape', () => {
    test('reshape/4line basic', () => {
      const [reshaped] = dustReshape(
        {
          art: lvl20 as ICachedArtifact,
          affixes: ['atk_', 'critRate_'],
          mintotal: 2,
        },
        emptyBuild
      )

      // Basic checks / ensure decimal form
      expect(reshaped.p).toBe(1)
      expect(reshaped.n.rollsLeft).toBe(5)
      expect(reshaped.n.base['atk_']).toBeCloseTo(5.8 / 100)
      expect(reshaped.n.base['critRate_']).toBeCloseTo(3.9 / 100)
      expect(reshaped.n.base['critDMG_']).toBeCloseTo(7.8 / 100)
      expect(reshaped.n.base['atk']).toBeCloseTo(19.45)
    })
    test('reshape/3line value tests', () => {
      const lvl20_3liner = { ...lvl20, totalRolls: 8 }
      const [reshaped] = dustReshape(
        {
          art: lvl20_3liner as ICachedArtifact,
          affixes: ['atk_', 'critRate_'],
          mintotal: 2,
        },
        emptyBuild
      )
      expect(reshaped.n.rollsLeft).toBe(4)
      const Eon = reshapeStats[4]
      const Eoff = 4 / 2 - Eon

      const rollsLevel = expandNodes([reshaped])
      const valuesLevel = expandNodes(rollsLevel)
      const g = reshaped.n.subDistr

      checkExpandedEvalCorrectness(obj, rollsLevel, g)
      checkExpandedEvalCorrectness(obj, valuesLevel, g)
      checkExpandedEvalCorrectness(obj3, rollsLevel, g)
      checkExpandedEvalCorrectness(obj3, valuesLevel, g)

      const expectedAtk =
        19.45 + 0.058 * 1000 + 0.85 * Eon * vatk_ * 1000 + 0.85 * Eoff * vatk // 149.72921875
      expect(evaluateGaussian(obj, g).f_mu[0]).toBeCloseTo(expectedAtk)

      const expectedCR = 0.039 + 0.85 * vcr_ * Eon // 0.0782646875
      expect(evaluateGaussian(obj3, g).f_mu[0]).toBeCloseTo(expectedCR)
    })
    test('reshape/dust ignores artifacts with missing initial rolls', () => {
      const reshapeNoInitialThrow = () =>
        dustReshape(
          {
            art: {
              setKey: 'GladiatorsFinale',
              slotKey: 'flower',
              level: 20,
              rarity: 5,
              mainStatKey: 'hp',
              location: '',
              lock: false,
              totalRolls: 9,
              substats: [
                { key: 'atk_', value: 46.6, initialValue: 5.8 },
                { key: 'critRate_', value: 31.1 },
                { key: 'critDMG_', value: 62.2, initialValue: 7.8 },
                { key: 'enerRech_', value: 25.9, initialValue: 6.5 },
              ],
            },
            affixes: ['atk_', 'critRate_'],
            mintotal: 2,
          },
          emptyBuild
        )
      expect(reshapeNoInitialThrow).toThrow()
    })
  })
  describe('define', () => {
    const p4 = 0.34
    const defined = elixirDefinition(
      {
        setKey: 'GladiatorsFinale',
        slotKey: 'flower',
        mainStatKey: 'hp',
        affixes: ['atk', 'atk_'],
        prob_4line: p4,
      },
      emptyBuild
    )
    const defined2 = elixirDefinition(
      {
        setKey: 'GladiatorsFinale',
        slotKey: 'flower',
        mainStatKey: 'hp',
        affixes: ['atk_', 'def'],
        prob_4line: p4,
      },
      emptyBuild
    )
    test('basic functionality', () => {
      expect(defined.reduce((ptot, { p }) => ptot + p, 0)).toBeCloseTo(1, 8)
      expect(
        defined.reduce(
          (ptot, { p, n }) => (n.rollsLeft === 5 ? ptot + p : ptot),
          0
        )
      ).toBeCloseTo(p4, 8)
      expect(
        defined.reduce(
          (ptot, { p, n }) => (n.rollsLeft === 4 ? ptot + p : ptot),
          0
        )
      ).toBeCloseTo(1 - p4, 8)
    })
    test('defined value tests (both on guarantee)', () => {
      const Eon3 = reshapeStats[4] + 1
      const Eon4 = reshapeStats[5] + 1

      const expectedAtk =
        0.85 * (Eon3 * vatk_ * 1000 + Eon3 * vatk) * (1 - p4) +
        0.85 * (Eon4 * vatk_ * 1000 + Eon4 * vatk) * p4
      const atk = defined.reduce(
        (atk, { p, n }) => atk + evaluateGaussian(obj, n.subDistr).f_mu[0] * p,
        0
      )
      expect(atk).toBeCloseTo(expectedAtk, 8)
    })
    test('defined value tests (1 on, 1 off)', () => {
      // Prob. atk appears as 3rd or 4th substat after hp + [atk%, def]
      const prob_atk = 143 / 350 // 6/28 + 16/28 * 6/24 + 6/28 * 6/25

      const Eon3 = reshapeStats[4] + 1
      const Eoff3 = (4 / 2 - reshapeStats[4] + 1) * prob_atk
      const Eon4 = reshapeStats[5] + 1
      const Eoff4 = (5 / 2 - reshapeStats[5] + 1) * prob_atk

      const expectedAtk =
        0.85 * (Eon3 * vatk_ * 1000 + Eoff3 * vatk) * (1 - p4) +
        0.85 * (Eon4 * vatk_ * 1000 + Eoff4 * vatk) * p4
      const atk = defined2.reduce(
        (atk, { p, n }) => atk + evaluateGaussian(obj, n.subDistr).f_mu[0] * p,
        0
      )
      expect(atk).toBeCloseTo(expectedAtk, 8)
    })
    test('defined with no set key', () => {
      const def = elixirDefinition(
        {
          setKey: '',
          slotKey: 'flower',
          mainStatKey: 'hp',
          affixes: ['atk', 'atk_'],
          prob_4line: p4,
        },
        emptyBuild
      )
      expect(def[0].n.base).toEqual({ hp: 4780 })
      expect(def.reduce((ptot, { p }) => ptot + p, 0)).toBeCloseTo(1, 8)
    })
    test('defined with memoization', () => {
      elixirDefinitionMemoize(
        {
          setKey: 'GladiatorsFinale',
          slotKey: 'flower',
          mainStatKey: 'atk_',
          affixes: ['atk', 'hp_'],
          prob_4line: 1,
        },
        emptyBuild,
        obj,
        {}
      )
    })
  })
})

describe('gen', () => {
  test('doathing', () => {
    // const umm = dothing()
    // writeFileSync('out.json', JSON.stringify(umm))

    // console.log(rollCountMuVar(5, {n: 0, min: 0}))
    console.log(rollCountMuVar(5, {n: 2, min: 2}))
  })
})
