import { genshinCalculatorWithEntries } from '../../index'
import { teamData, withMember } from '../../util'
import { own, ownBuff } from '../util'

describe('transformative reaction crit multiplier by crit mode', () => {
  const critRate = 0.6
  const critDmg = 1.2
  const calcFor = (critMode: 'crit' | 'nonCrit' | 'avg') =>
    genshinCalculatorWithEntries([
      ...teamData(['0']),
      ...withMember(
        '0',
        own.char.lvl.add(90),
        ownBuff.trans.critRate_.add(critRate),
        ownBuff.trans.critDMG_.add(critDmg)
      ),
      ownBuff.common.critMode.add(critMode),
    ]).withTag({ src: '0' })

  test('crit hits multiply by 1 + crit DMG, not 1 + crit rate', () => {
    expect(calcFor('crit').compute(own.trans.critMulti).val).toBeCloseTo(
      1 + critDmg,
      12
    )
  })

  test('non-crit hits multiply by 1', () => {
    expect(calcFor('nonCrit').compute(own.trans.critMulti).val).toBe(1)
  })

  test('average hits multiply by 1 + crit rate * crit DMG', () => {
    expect(calcFor('avg').compute(own.trans.critMulti).val).toBeCloseTo(
      1 + critRate * critDmg,
      12
    )
  })
})
