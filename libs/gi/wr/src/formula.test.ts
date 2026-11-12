import { common, input } from './formula'
import { constantFold } from './optimization'
import type { ConstantNode } from './type'
import { constant, percent, sum } from './utils'

describe('enemy defense multiplier', () => {
  test.each([
    -0.2, 0, 0.5, 0.9, 1, 1.4,
  ])('caps total DEF reduction at 90%% (reduction: %s)', (reduction) => {
    for (const ignore of [0, 0.4, 1]) {
      const result = constantFold(
        [input.enemy.def, input.enemy.transDef],
        {
          lvl: constant(90),
          enemy: { ...common.enemy, level: constant(100) },
          total: {
            // The cap applies after combining all sources of DEF reduction.
            enemyDefRed_: sum(percent(reduction / 2), percent(reduction / 2)),
            enemyDefIgn_: percent(ignore),
          },
        },
        () => true
      ) as ConstantNode<number>[]
      const remainingDef = (1 - Math.min(reduction, 0.9)) * (1 - ignore)
      expect(result[0].value).toBeCloseTo(190 / (190 + 200 * remainingDef), 12)
      expect(result[1].value).toBeCloseTo(
        99999999 / (99999999 + 1000 * remainingDef),
        12
      )
    }
  })
})
