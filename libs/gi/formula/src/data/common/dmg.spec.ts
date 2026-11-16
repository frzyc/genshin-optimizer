import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import { genshinCalculatorWithEntries } from '../../index'
import {
  artifactsData,
  charData,
  teamData,
  weaponData,
  withMember,
} from '../../util'
import { enemyDebuff, own, ownBuff, percent } from '../util'

describe('crit multiplier by crit mode', () => {
  const critRate = 0.6
  const critDmg = 1.2
  const calcFor = (critMode: 'crit' | 'nonCrit' | 'avg') =>
    genshinCalculatorWithEntries([
      ...teamData(['0']),
      ...withMember(
        '0',
        own.char.lvl.add(90),
        ownBuff.premod.critRate_.add(critRate),
        ownBuff.premod.critDMG_.add(critDmg)
      ),
      enemyDebuff.common.lvl.add(90),
      ownBuff.common.critMode.add(critMode),
    ]).withTag({ src: '0' })

  test('crit hits multiply by 1 + crit DMG, not 1 + crit rate', () => {
    const calc = calcFor('crit')
    const finalCritDmg = calc.compute(own.final.critDMG_).val as number
    expect(finalCritDmg).toBeGreaterThanOrEqual(critDmg)
    expect(calc.compute(own.dmg.critMulti).val).toBeCloseTo(
      1 + finalCritDmg,
      12
    )
  })

  test('non-crit hits multiply by 1', () => {
    expect(calcFor('nonCrit').compute(own.dmg.critMulti).val).toBe(1)
  })

  test('average hits multiply by 1 + crit rate * crit DMG', () => {
    const calc = calcFor('avg')
    const finalCritDmg = calc.compute(own.final.critDMG_).val as number
    const finalCritRate = calc.compute(own.common.cappedCritRate_).val as number
    expect(calc.compute(own.dmg.critMulti).val).toBeCloseTo(
      1 + finalCritRate * finalCritDmg,
      12
    )
  })
})

describe('character damage formula by crit mode', () => {
  const char: ICharacter = {
    key: 'Noelle',
    level: 80,
    talent: { auto: 8, skill: 8, burst: 8 },
    ascension: 6,
    constellation: 6,
  }
  const weapon: IWeapon = {
    key: 'FavoniusGreatsword',
    level: 90,
    ascension: 6,
    refinement: 1,
    location: 'Noelle',
    lock: false,
  }
  const normal0 = (critMode: 'crit' | 'nonCrit' | 'avg') => {
    const calc = genshinCalculatorWithEntries([
      ...teamData(['0']),
      ...withMember(
        '0',
        ...charData(char),
        ...weaponData(weapon),
        ...artifactsData([]),
        // Distinct, non-default crit stats so rate and DMG cannot be confused
        ownBuff.premod.critRate_.add(0.6),
        ownBuff.premod.critDMG_.add(1.2)
      ),
      enemyDebuff.reaction.cata.add(''),
      enemyDebuff.reaction.amp.add(''),
      enemyDebuff.common.lvl.add(90),
      enemyDebuff.common.preRes.add(0.1),
      ownBuff.common.critMode.add(critMode),
    ]).withTag({ src: '0' })
    const read = calc
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.name === 'normal_0')!
    return {
      dmg: calc.compute(read).val as number,
      critRate: calc.compute(own.common.cappedCritRate_).val as number,
      critDmg: calc.compute(own.final.critDMG_).val as number,
    }
  }

  test('crit damage is non-crit damage * (1 + crit DMG)', () => {
    const { dmg: nonCrit } = normal0('nonCrit')
    const { dmg: crit, critDmg } = normal0('crit')
    expect(critDmg).toBeGreaterThan(1.2)
    expect(crit).toBeCloseTo(nonCrit * (1 + critDmg), 6)
  })

  test('average damage is non-crit damage * (1 + crit rate * crit DMG)', () => {
    const { dmg: nonCrit } = normal0('nonCrit')
    const { dmg: avg, critRate, critDmg } = normal0('avg')
    expect(avg).toBeCloseTo(nonCrit * (1 + critRate * critDmg), 6)
  })
})

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
