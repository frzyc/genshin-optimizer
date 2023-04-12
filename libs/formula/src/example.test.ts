import { compileTagMapValues } from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
import {
  convert,
  Data,
  enemyDebuff,
  reader,
  selfBuff,
  selfTag,
  team,
  userBuff,
} from './data/util'
import {} from './debug'
import {
  artifactsData,
  charData,
  teamData,
  weaponData,
  withMember,
} from './util'

// This test acts as an example usage. It's mostly sufficient to test that the code
// doesn't crash. Any test for correct values should go to `correctness` tests.
// Should a test here fail, extract a minimized version to `correctness` test.
describe('example', () => {
  const data: Data = [
      ...teamData(['member0'], ['member0', 'member1']),

      ...withMember(
        'member0',
        ...charData({
          name: 'Nahida',
          lvl: 12,
          ascension: 0,
          constellation: 2,
          conds: {
            a1ActiveInBurst: 'off',
            c2Bloom: 'on',
            c2QSA: 'off',
            c4Count: 'off',
          },
        }),
        ...weaponData({
          name: 'TulaytullahsRemembrance',
          lvl: 42,
          ascension: 2,
          refinement: 2,
          conds: {
            timePassive: 0,
            hitPassive: 0,
          },
        }),
        ...artifactsData(
          [
            /* per art stat */
          ],
          {
            /* conditionals */
          }
        ),

        // custom buff
        userBuff.premod.def.add(30)
      ),
      ...withMember(
        'member1',
        ...charData({
          name: 'Nilou',
          lvl: 33,
          ascension: 1,
          constellation: 3,
          conds: {
            a1AfterSkill: 'off',
            a1AfterHit: 'off',
            c2Hydro: 'off',
            c2Dendro: 'off',
            c4AfterPirHit: 'off',
          },
        }),
        ...weaponData({
          name: 'KeyOfKhajNisut',
          lvl: 59,
          ascension: 3,
          refinement: 3,
          conds: {
            afterSkillStacks: 3,
          },
        }),
        ...artifactsData(
          [
            /* per art stat */
          ],
          {
            /* conditionals */
          }
        )
      ),

      // Enemy
      enemyDebuff.cond.cata.add('spread'),
      enemyDebuff.cond.amp.add(''),
      enemyDebuff.common.lvl.add(12),
      enemyDebuff.common.preRes.add(0.1),
      selfBuff.common.critMode.add('avg'),
    ],
    calc = new Calculator(keys, values, compileTagMapValues(keys, data))

  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  const member1 = convert(selfTag, { member: 'member1', et: 'self' })

  test('calculate stats', () => {
    expect(calc.compute(member1.final.hp).val).toBeCloseTo(9479.7, 1)
    expect(calc.compute(member0.final.atk).val).toBeCloseTo(346.21, 2)
    expect(calc.compute(member0.final.def).val).toBeCloseTo(124.15, 2)
    expect(calc.compute(member0.final.eleMas).val).toBeCloseTo(28.44, 2)
    expect(calc.compute(member0.final.critRate_).val).toBe(0.05)
    expect(calc.compute(member0.final.critRate_.burgeon).val).toBeCloseTo(
      0.25,
      2
    )
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
    // NOT `team` since this uses a specific formula, but the value from every member is the same
    expect(calc.compute(member0.common.eleCount).val).toBe(2)

    expect(calc.compute(team.final.eleMas).val).toEqual(
      calc.compute(member0.final.eleMas).val +
        calc.compute(member1.final.eleMas).val
    )
  })
  describe('list final formulas', () => {
    /**
     * Each entry in listing is a `Tag` in the shape of
     * ```
     * {
     *   member: 'member'
     *   et: 'self'
     *   src: <sheet that defines the formula>
     *   qt: 'formula'
     *   q: < 'dmg' / 'trans' / 'shield' / 'heal' >
     *   name: <formula name>
     * }
     * ```
     */
    const listing = calc.listFormulas({ member: 'member0' })

    // Simple check that all tags are in the correct format
    const names: string[] = []
    for (const { name, move, ...tag } of listing.filter(
      (x) => x.src === 'Nahida'
    )) {
      names.push(name!)
      expect(name).toBeTruthy()
      expect(move).toBeTruthy()
      test(`with name ${name}`, () => {
        expect(tag).toEqual({
          member: 'member0',
          et: 'self',
          src: 'Nahida',
          qt: 'formula',
          q: 'dmg', // DMG formula
        })
      })
    }
    expect(names.sort()).toEqual([
      'charged',
      'karma_dmg',
      'normal_0',
      'normal_1',
      'normal_2',
      'normal_3',
      'plunging_dmg',
      'plunging_high',
      'plunging_low',
      'skill_hold',
      'skill_press',
    ])
    expect(listing.filter((x) => x.src === 'static').length).toEqual(5)
  })
  test('calculate final formulas', () => {
    const tag = calc
      .listFormulas({ member: 'member0' })
      .find((x) => x.name === 'normal_0')!
    expect(tag).toBeTruthy()
    expect(tag.src).toEqual('Nahida') // Formula from Nahida
    expect(tag.q).toEqual('dmg') // DMG formula
    expect(tag.name).toEqual('normal_0') // Formula name

    // Compute formula
    const { val, meta } = calc.compute(reader.withTag(tag))
    const { amp, move, ele, cata } = meta.tag!

    // Calculation result, reaction, element, etc
    expect(val).toBeCloseTo(91.61, 2)
    expect(amp).toEqual('')
    expect(move).toEqual('normal')
    expect(ele).toEqual('dendro')
    expect(cata).toEqual('spread')
  })
  test('list conditionals affecting a given node', () => {
    const result = calc.compute(member0.common.cappedCritRate_.burgeon)
    const conds = result.meta.conds

    expect(conds.length).toEqual(2)
    expect(conds[0]).toEqual({
      et: 'self',
      member: 'member0',
      trans: 'burgeon',
      dst: 'member0',
      src: 'Nahida',
      qt: 'cond',
      q: 'c2Bloom',
    })
    // It is duplicated because this conditional affects two distinct
    // stats, `critRate_` and `critDMG_`. Deduplicating this requires
    // tag equality, which may not be worth it.
    expect(conds[1]).toEqual(conds[0])
  })
  test.skip('create optimization calculation', () => {
    throw new Error('Add test')
  })
})
