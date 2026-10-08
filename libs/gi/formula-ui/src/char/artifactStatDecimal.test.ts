import { toDecimal } from '@genshin-optimizer/common/util'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import {
  artifactsData,
  charData,
  enemyDebuff,
  genshinCalculatorWithEntries,
  own,
  ownBuff,
  pandoContextEntries,
  teamData,
  travelerMemberSrcs,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import { describe, expect, it } from 'vitest'

const char: ICharacter = {
  key: 'Noelle',
  level: 90,
  talent: { auto: 9, skill: 9, burst: 9 },
  ascension: 6,
  constellation: 6,
}
const weapon: IWeapon = {
  key: 'WasterGreatsword',
  level: 90,
  ascension: 6,
  refinement: 1,
  location: 'Noelle',
  lock: false,
}

function calcWithArts(stats: readonly { key: 'enerRech_'; value: number }[]) {
  return genshinCalculatorWithEntries([
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData(char),
      ...weaponData(weapon),
      ...artifactsData([{ set: 'Adventurer', stats }])
    ),
    enemyDebuff.common.lvl.add(90),
    enemyDebuff.common.preRes.add(0.1),
    ownBuff.common.critMode.add('avg'),
    ...pandoContextEntries({
      memberKeys: ['0'],
      travelerSrcs: travelerMemberSrcs([{ src: '0', charKey: 'Noelle' }]),
    }),
  ]).withTag({ src: '0' })
}

describe('artifact stat units for gi-frontend', () => {
  it('bare Noelle has 0% bonus ER in Pando', () => {
    const calc = calcWithArts([])
    expect(calc.compute(own.final.enerRech_).val).toBeCloseTo(0)
  })

  it('converts display-percent artifact ER like CharCalcProvider', () => {
    const displayEr = 51.8
    const calc = calcWithArts([
      { key: 'enerRech_', value: toDecimal(displayEr, 'enerRech_') },
    ])
    expect(calc.compute(own.final.enerRech_).val).toBeCloseTo(0.518)
  })

  it('rejects raw display ER without toDecimal (100x inflation)', () => {
    const calc = calcWithArts([{ key: 'enerRech_', value: 51.8 }])
    expect(calc.compute(own.final.enerRech_).val).toBeCloseTo(51.8)
  })
})
