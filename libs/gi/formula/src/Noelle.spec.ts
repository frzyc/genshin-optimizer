import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import type { TagMapNodeEntries } from './data/util'
import { conditionalEntries, enemyDebuff, own, ownBuff } from './data/util'
import { genshinCalculatorWithEntries } from './index'
import { conditionals, formulas } from './meta'
import {
  artifactsData,
  charData,
  teamData,
  weaponData,
  withMember,
} from './util'

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

const expectedNames = [
  'a1_cd',
  'a1_duration',
  'a1_shield',
  'burst',
  'burst_atkFromDef',
  'burst_cd',
  'burst_duration',
  'burst_enerCost',
  'burst_skill',
  'c2_charged_dmg_',
  'c2_staminaChargedDec_',
  'c4',
  'charged_duration',
  'charged_final',
  'charged_spinning',
  'charged_stamina',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_cd',
  'skill_duration',
  'skill_heal',
  'skill_healChance',
  'skill_shield',
].sort()

/** Own-stat conds are read with dst:null (see teamData target reread). */
const sweepingTimeOn = conditionalEntries(
  'Noelle',
  '0',
  null
)('SweepingTime', 1)

describe('Noelle Pando port', () => {
  const data: TagMapNodeEntries = [
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData(char),
      ...weaponData(weapon),
      ...artifactsData([])
    ),
    sweepingTimeOn,
    enemyDebuff.reaction.cata.add(''),
    enemyDebuff.reaction.amp.add(''),
    enemyDebuff.common.lvl.add(90),
    enemyDebuff.common.preRes.add(0.1),
    ownBuff.common.critMode.add('avg'),
  ]
  const calc = genshinCalculatorWithEntries(data).withTag({ src: '0' })

  test('conditionals match WR names', () => {
    expect(Object.keys(conditionals.Noelle).sort()).toEqual(['SweepingTime'])
  })

  test('listing names', () => {
    expect(Object.keys(formulas.Noelle).sort()).toEqual(expectedNames)
  })

  test('SweepingTime raises ATK from DEF', () => {
    const off = genshinCalculatorWithEntries([
      ...teamData(['0']),
      ...withMember(
        '0',
        ...charData(char),
        ...weaponData(weapon),
        ...artifactsData([])
      ),
      enemyDebuff.reaction.cata.add(''),
      enemyDebuff.reaction.amp.add(''),
      enemyDebuff.common.lvl.add(90),
      enemyDebuff.common.preRes.add(0.1),
      ownBuff.common.critMode.add('avg'),
    ]).withTag({ src: '0' })
    const atkOff = off.compute(own.final.atk).val as number
    const atkOn = calc.compute(own.final.atk).val as number
    expect(atkOn).toBeGreaterThan(atkOff)
  })

  test('SweepingTime infuses geo and C2 reduces charged stamina', () => {
    const off = genshinCalculatorWithEntries([
      ...teamData(['0']),
      ...withMember(
        '0',
        ...charData(char),
        ...weaponData(weapon),
        ...artifactsData([])
      ),
      enemyDebuff.reaction.cata.add(''),
      enemyDebuff.reaction.amp.add(''),
      enemyDebuff.common.lvl.add(90),
      enemyDebuff.common.preRes.add(0.1),
      ownBuff.common.critMode.add('avg'),
    ]).withTag({ src: '0' })
    expect(off.compute(own.reaction.infusion).val).toBe('physical')
    expect(calc.compute(own.reaction.infusion).val).toBe('geo')
    expect(calc.compute(own.final.staminaChargedDec_).val).toBeCloseTo(0.2)
  })

  test('finals are finite', () => {
    for (const read of [
      own.final.atk,
      own.final.hp,
      own.final.def,
      own.final.eleMas,
      own.final.critRate_,
      own.final.critDMG_,
      own.final.enerRech_,
    ]) {
      const val = calc.compute(read).val
      expect(typeof val).toBe('number')
      expect(Number.isFinite(val)).toBe(true)
    }
  })

  test('listings compute finite', () => {
    const listing = calc
      .listFormulas(own.listing.formulas)
      .filter((x) => x.tag.sheet === 'Noelle' && x.tag.qt === 'formula')
    expect(listing.map((x) => x.tag.name).sort()).toEqual(expectedNames)
    for (const read of listing) {
      const val = calc.compute(read).val
      expect(Number.isFinite(val as number), read.tag.name).toBe(true)
    }
  })

  test('optimize UI tag listFormulas stays bounded', () => {
    const uiCalc = genshinCalculatorWithEntries(data).withTag({
      src: '0',
      dst: null,
      preset: 'preset0',
    })
    const reads = uiCalc.listFormulas(own.listing.formulas)
    expect(reads.length).toBeGreaterThan(0)
    expect(reads.length).toBeLessThan(500)
    for (const read of reads) {
      expect(Number.isFinite(uiCalc.compute(read).val as number)).toBe(true)
    }
  })

  test('heal and param listings keep q after compute', () => {
    const listing = calc
      .listFormulas(own.listing.formulas)
      .filter((x) => x.tag.sheet === 'Noelle')
    const heal = listing.find((x) => x.tag.name === 'skill_heal')
    const cd = listing.find((x) => x.tag.name === 'burst_cd')
    expect(heal?.tag.q).toBe('heal')
    expect(cd?.tag.q).toBe('param')
    expect(calc.compute(heal!).meta.tag?.q).toBe('heal')
    expect(calc.compute(cd!).meta.tag?.q).toBe('param')
  })
})
