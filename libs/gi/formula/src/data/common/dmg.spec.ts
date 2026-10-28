import { genshinCalculatorWithEntries } from '../../index'
import { teamData, withMember } from '../../util'
import { enemyDebuff, own, percent } from '../util'

describe('enemy defense multiplier', () => {
  test.each([
    -0.2, 0, 0.5, 0.9, 1, 1.4,
  ])('caps total DEF reduction at 90%% (reduction: %s)', (reduction) => {
    for (const ignore of [0, 0.4, 1]) {
      const calc = genshinCalculatorWithEntries([
        ...teamData(['0']),
        ...withMember('0', own.char.lvl.add(90)),
        enemyDebuff.common.lvl.add(100),
        enemyDebuff.common.defRed_.add(percent(reduction / 2)),
        enemyDebuff.common.defRed_.add(percent(reduction / 2)),
        enemyDebuff.common.defIgn.add(percent(ignore)),
      ]).withTag({ src: '0' })
      const remainingDef = (1 - Math.min(reduction, 0.9)) * (1 - ignore)
      expect(calc.compute(own.dmg.def_mult_).val).toBeCloseTo(
        190 / (190 + 200 * remainingDef),
        12
      )
    }
  })
})
