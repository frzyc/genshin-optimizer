import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import { isActive } from './data/common/conds'
import {
  conditionalEntries,
  hexereiTally,
  own,
  ownBuff,
  team,
} from './data/util'
import { genshinCalculatorWithEntries } from './index'
import { charData, teamData, withMember } from './util'

function char(key: CharacterKey): ICharacter {
  return {
    key,
    level: 1,
    talent: { auto: 1, skill: 1, burst: 1 },
    ascension: 0,
    constellation: 0,
  }
}

describe('party tallies', () => {
  const calc = genshinCalculatorWithEntries([
    ...teamData(['0', '1']),
    ...withMember('0', ...charData(char('Aino')), hexereiTally(1)),
    ...withMember('1', ...charData(char('Nahida'))),
    conditionalEntries('dyn', '1', null)('isActive', 1),
  ])
  const mem0 = calc.withTag({ src: '0' })
  const mem1 = calc.withTag({ src: '1' })

  test('element and region counts', () => {
    expect(mem0.compute(own.common.count.hydro).val).toBe(1)
    expect(mem1.compute(own.common.count.dendro).val).toBe(1)
    expect(calc.compute(team.common.count.hydro).val).toBe(1)
    expect(calc.compute(team.common.count.dendro).val).toBe(1)
    expect(mem0.compute(own.common.eleCount).val).toBe(2)
    expect(mem0.compute(own.common.count.nodKrai).val).toBe(1)
    expect(calc.compute(team.common.count.nodKrai).val).toBe(1)
    expect(calc.compute(team.common.count.sumeru).val).toBe(1)
  })

  test('moonsign and hexerei', () => {
    expect(mem0.compute(own.common.moonsign).val).toBe(1)
    expect(mem1.compute(own.common.moonsign).val).toBe(0)
    expect(calc.compute(team.common.moonsign).val).toBe(1)
    expect(mem0.compute(own.common.hexerei).val).toBe(1)
    expect(calc.compute(team.common.hexerei).val).toBe(1)
  })

  test('highest EM is team.premod.eleMas.max', () => {
    const em0 = mem0.compute(own.premod.eleMas).val
    const em1 = mem1.compute(own.premod.eleMas).val
    expect(calc.compute(team.premod.eleMas.max).val).toBe(Math.max(em0, em1))
  })

  test('isActive is src-scoped from dyn', () => {
    expect(mem0.compute(isActive.ifOn(1)).val).toBe(0)
    expect(mem1.compute(isActive.ifOn(1)).val).toBe(1)
  })

  test('activeEle follows the on-field member', () => {
    expect(mem1.compute(own.common.activeEle.dendro).val).toBe(1)
    expect(mem1.compute(own.common.activeEle.hydro).val).toBe(0)
    expect(calc.compute(team.common.activeEle.dendro).val).toBe(1)
    expect(calc.compute(team.common.activeEle.hydro).val).toBe(0)
  })
})

describe('splitScale listing', () => {
  test('Nahida karma stays a skill dmg listing', () => {
    const calc = genshinCalculatorWithEntries([
      ...teamData(['0']),
      ...withMember('0', ...charData(char('Nahida'))),
      ownBuff.common.critMode.add('avg'),
    ]).withTag({ src: '0' })
    const karma = calc
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.name === 'karma_dmg')
    expect(karma?.tag.q).toBe('dmg')
    expect(karma?.tag.move).toBe('skill')
    expect(karma?.tag.ele).toBe('dendro')
  })
})
