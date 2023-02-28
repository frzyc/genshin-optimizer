import { compileTagMapValues } from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
import { convert, Data, enemyDebuff, reader, selfBuff, selfTag, team, userBuff } from './data/util'
import { } from './debug'
import { artifactsData, charData, teamData, weaponData, withMember } from './util'

// This test acts as an example usage. It's mostly sufficient to test that the code
// doesn't crash. Any test for correct values should go to `correctness` tests.
// Should a test here fail, extract a minimized version to `correctness` test.
describe('example', () => {
  const data: Data = [
    ...teamData(['member0'], ['member0', 'member1']),

    ...withMember('member0',
      ...charData({
        name: 'Nahida', lvl: 12, ascension: 0, constellation: 2, custom: {
          a1ActiveInBurst: 'off', c2Bloom: 'on', c2QSA: 'off', c4Count: 'off'
        }
      }),
      ...weaponData({
        name: 'TulaytullahsRemembrance', lvl: 42, ascension: 2, refinement: 2, custom: {
          timePassive: 0, hitPassive: 0
        }
      }),
      ...artifactsData([/* per art stat */], { /* conditionals */ }),

      // custom buff
      userBuff.premod.def.add(30)
    ),
    ...withMember('member1',
      ...charData({
        name: 'Nilou', lvl: 33, ascension: 1, constellation: 3, custom: {
          a1AfterSkill: 'off', a1AfterHit: 'off',
          c2Hydro: 'off', c2Dendro: 'off', c4AfterPirHit: 'off'
        }
      }),
      ...weaponData({
        name: 'KeyOfKhajNisut', lvl: 59, ascension: 3, refinement: 3, custom: {
          afterSkillStacks: 3
        }
      }),
      ...artifactsData([/* per art stat */], { /* conditionals */ }),
    ),

    // Enemy
    enemyDebuff.cond.cata.add('spread'),
    enemyDebuff.cond.amp.add(''),
    enemyDebuff.common.lvl.add(12),
    enemyDebuff.common.preRes.add(0.10),
    selfBuff.common.critMode.add('avg'),
  ], calc = new Calculator(keys, values, compileTagMapValues(keys, data))

  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  const member1 = convert(selfTag, { member: 'member1', et: 'self' })

  test('calculate stats', () => {
    expect(calc.compute(member1.final.hp).val).toBeCloseTo(9479.7, 1)
    expect(calc.compute(member0.final.atk).val).toBeCloseTo(346.21, 2)
    expect(calc.compute(member0.final.def).val).toBeCloseTo(124.15, 2)
    expect(calc.compute(member0.final.eleMas).val).toBeCloseTo(28.44, 2)
    expect(calc.compute(member0.final.critRate_).val).toBe(0.05)
    expect(calc.compute(member0.final.critRate_.burgeon).val).toBeCloseTo(0.25, 2)
    expect(calc.compute(member0.common.cappedCritRate_).val).toBe(0.05)
    expect(calc.compute(member0.common.cappedCritRate_.burgeon).val).toBe(0.25)
  })
  test('calculate team stats', () => {
    // Nahida's contribution to `common.count`
    expect(calc.compute(member0.common.count.hydro).val).toBe(0)
    expect(calc.compute(member0.common.count.dendro).val).toBe(1)

    // Team's final `common.count`
    expect(calc.compute(team.common.count.dendro).val).toBe(1)
    expect(calc.compute(team.common.count.hydro).val).toBe(1)
    // NOT `team` since this uses a specific formula, but the values from every member are the same
    expect(calc.compute(member0.common.eleCount).val).toBe(2)

    expect(calc.compute(team.final.eleMas).val).toEqual(
      calc.compute(member0.final.eleMas).val + calc.compute(member1.final.eleMas).val)
  })
  test('calculate optimization targets', () => {
    const normal_0 = reader.withTag({ member: 'member0', src: 'prep', prep: 'dmg', nameSrc: 'Nahida' }).name('normal_0')
    const normal_1 = reader.withTag({ member: 'member0', src: 'prep', prep: 'dmg', nameSrc: 'Nahida' }).name('normal_1')

    expect(calc.compute(normal_0).val).toBeCloseTo(91.61, 2)
    expect(calc.compute(normal_1).val).toBeCloseTo(86.23, 2)
  })
  test('list optimization targets', () => {
    throw new Error('Add test')
  })
  test('create optimization calculation', () => {
    throw new Error('Add test')
  })
})
