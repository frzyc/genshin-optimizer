import { cartesian, range } from '@genshin-optimizer/common/util'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import type { DynStat } from '@genshin-optimizer/gi/solver'

import type { RollsLevelNode, ValuesLevelNode } from './upOpt.types'
import { quadrinomial } from './mathUtil'

export function expandRollsLevel({
  base,
  subs,
  rarity,
}: RollsLevelNode): { p: number; n: ValuesLevelNode }[] {
  // TODO: Given a rolls node, return a list of Values nodes and evaluate them.
  const rollValues = subs.map(({ key, rolls }) => {
    const rollValue = range(7 * rolls, 10 * rolls + 1)
    return rollValue.map((v) => ({
      p: 4 ** -rolls * quadrinomial(rolls, v - 7 * rolls),
      stat: {
        [key]: (v * getSubstatValue(key, rarity, 'max', false)) / 10,
      },
    }))
  })
  return cartesian(...rollValues).map((rvs) => {
    const { p, stat } = rvs.reduce((acc, rv) => ({
      p: acc.p * rv.p,
      stat: { ...acc.stat, ...rv.stat },
    }))

    const stats = { ...base }
    Object.entries(stat).forEach(([k, v]) => (stats[k] = (stats[k] ?? 0) + v))

    return {
      p,
      n: makeValuesNode(stats),
    }
  })
}

export function makeValuesNode(base: DynStat): ValuesLevelNode {
  const subDistr = {
    base,
    subs: [],
    mu: [],
    cov: [[]],
  }
  return {
    type: 'values',
    subDistr,
  }
}
