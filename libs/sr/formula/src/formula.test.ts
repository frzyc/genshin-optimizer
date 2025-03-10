import {
  cmpEq,
  compileTagMapValues,
  prod,
  setDebugMode,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
  type AscensionKey,
  type CharacterKey,
  type LightConeKey,
} from '@genshin-optimizer/sr/consts'
import { fail } from 'assert'
import {
  charTagMapNodeEntries,
  lightConeTagMapNodeEntries,
  teamData,
  withMember,
} from '.'
import { Calculator } from './calculator'
import { data, keys, values } from './data'
import {
  convert,
  enemyTag,
  own,
  ownBuff,
  ownTag,
  percent,
  semiOwn,
  tagStr,
  target,
  team,
  teamBuff,
  type TagMapNodeEntries,
} from './data/util'

setDebugMode(true)
// This is generally unnecessary, but without it, some tags in `DebugCalculator` will be missing
Object.assign(values, compileTagMapValues(keys, data))

describe('character test', () => {
  it.each([
    [1, 0, 69.6, 78, 144, 101],
    [20, 0, 135.72, 152.1, 280.8, 101],
    [20, 1, 163.56, 183.3, 338.4, 101],
    [80, 6, 511.56, 573.3, 1058.4, 101],
  ])('Calculate character base stats', (lvl, ascension, atk, def, hp, spd) => {
    const charKey: CharacterKey = 'March7th'
    const data: TagMapNodeEntries = [
      ...withMember(
        'March7th',
        ...charTagMapNodeEntries(
          {
            level: lvl,
            ascension: ascension as AscensionKey,
            key: charKey,
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        )
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    const m7 = convert(ownTag, { et: 'own', src: 'March7th' })
    expect(calc.compute(m7.final.atk).val).toBeCloseTo(atk)
    expect(calc.compute(m7.final.def).val).toBeCloseTo(def)
    expect(calc.compute(m7.final.hp).val).toBeCloseTo(hp)
    expect(calc.compute(m7.final.spd).val).toBeCloseTo(spd)
  })
})

describe('lightCone test', () => {
  it.each([
    [1, 0, 14.4, 12, 38.4],
    [20, 0, 55.44, 46.2, 147.84],
    [20, 1, 72.72, 60.6, 193.92],
  ])('Calculate lightCone base stats', (lvl, ascension, atk, def, hp) => {
    const lcKey: LightConeKey = 'Arrows'
    const data: TagMapNodeEntries = [
      ...withMember(
        'March7th',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'March7th',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        ),
        ...lightConeTagMapNodeEntries(lcKey, lvl, ascension as AscensionKey, 1)
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    const lightCone0 = convert(ownTag, {
      et: 'own',
      src: 'March7th',
      sheet: 'lightCone',
    })
    expect(calc.compute(lightCone0.base.atk).val).toBeCloseTo(atk)
    expect(calc.compute(lightCone0.base.def).val).toBeCloseTo(def)
    expect(calc.compute(lightCone0.base.hp).val).toBeCloseTo(hp)
  })
})

describe('char+lightCone test', () => {
  it('calculate base stats', () => {
    const charKey: CharacterKey = 'March7th'
    const lcKey: LightConeKey = 'Amber'

    const data: TagMapNodeEntries = [
      ...withMember(
        'March7th',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: charKey,
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        ),
        ...lightConeTagMapNodeEntries(lcKey, 1, 0, 1)
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const m7 = convert(ownTag, { et: 'own', src: 'March7th' })
    expect(calc.compute(m7.final.atk).val).toBeCloseTo(81.6)
  })
})

describe('team test', () => {
  it('counts paths', () => {
    const data: TagMapNodeEntries = [
      ...teamData(['Acheron', 'Argenti']),
      ...withMember(
        'Acheron',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Acheron',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        )
      ),
      ...withMember(
        'Argenti',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Argenti',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          2
        )
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    expect(calc.compute(team.common.count.withPath('Nihility')).val).toEqual(1)
    expect(calc.compute(team.common.count.withPath('Erudition')).val).toEqual(1)
    expect(calc.compute(team.common.count.withPath('TheHunt')).val).toEqual(0)
  })
  it('can buff based on position', () => {
    const data: TagMapNodeEntries = [
      ...teamData(['Acheron', 'Argenti']),
      ...withMember(
        'Acheron',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Acheron',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        )
      ),
      ...withMember(
        'Argenti',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Argenti',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          2
        ),
        teamBuff.premod.atk.add(cmpEq(target.char.teamPosition, 1, 10000))
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const acheron = convert(ownTag, { et: 'own', src: 'Acheron' })
    const argenti = convert(ownTag, { et: 'own', src: 'Argenti' })
    expect(calc.compute(acheron.final.atk).val).greaterThan(10000)
    expect(calc.compute(argenti.final.atk).val).lessThan(10000)
  })
  it('can read individual and team energy', () => {
    const data: TagMapNodeEntries = [
      ...teamData(['Acheron', 'Argenti']),
      ...withMember(
        'Acheron',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Acheron',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        )
      ),
      ...withMember(
        'Argenti',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Argenti',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          2
        )
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    expect(
      calc.withTag({ src: 'Argenti' }).compute(own.char.maxEnergy).val
    ).toEqual(180)
    expect(calc.compute(team.char.maxEnergy.sum).val).toEqual(189)
  })

  it('can calculate heals based on target HP', () => {
    const data: TagMapNodeEntries = [
      ...teamData(['Acheron', 'Argenti']),
      ...withMember(
        'Acheron',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Acheron',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        ),
        ownBuff.premod.heal_.add(1.5)
      ),
      ...withMember(
        'Argenti',
        ...charTagMapNodeEntries(
          {
            level: 1,
            ascension: 0,
            key: 'Argenti',
            eidolon: 0,
            basic: 0,
            skill: 0,
            ult: 0,
            talent: 0,
            servantSkill: 0,
            servantTalent: 0,
            bonusAbilities: {},
            statBoosts: {},
          },
          1
        ),
        ownBuff.premod.incHeal_.add(2.5)
      ),
      ownBuff.formula.base.add(target.final.hp),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const copiedHealFormula = prod(
      semiOwn.formula.base,
      sum(percent(1), own.final.heal_),
      sum(percent(1), target.final.incHeal_)
    )

    expect(
      calc
        .withTag({ src: 'Acheron', dst: 'Argenti' })
        .toDebug()
        .compute(copiedHealFormula).val
    ).toEqual(142.56 * (1 + 1.5) * (1 + 2.5))
  })
})

describe('sheet', () => {
  test('buff entries', () => {
    const sheets = new Set([
      ...allCharacterKeys,
      ...allLightConeKeys,
      ...allRelicSetKeys,
      'relic',
      'lightCone',
    ])
    for (const { tag } of data) {
      if (tag.et && tag.qt && tag.q) {
        switch (tag.et) {
          case 'notOwnBuff':
          case 'teamBuff': {
            const { sheet } = (ownTag as any)[tag.qt][tag.q]
            // Buff entries are for agg queries inside a sheet
            if (sheet === 'agg' && sheets.has(tag.sheet as any)) continue
            fail(`Ill-form entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
          // eslint-disable-next-line no-fallthrough
          case 'enemyDeBuff': {
            const { sheet } = (enemyTag as any)[tag.qt][tag.q]
            if (sheet === 'agg' && sheets.has(tag.sheet as any)) continue
            if (sheet === tag.sheet) continue
            fail(`Ill-form entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
          // eslint-disable-next-line no-fallthrough
          case 'own': {
            const desc = (ownTag as any)[tag.qt]?.[tag.q]
            if (!desc) continue
            const { sheet } = desc
            if (!sheet) continue
            if (sheet === 'iso' || sheet === 'agg' || sheet === tag.sheet)
              continue
            fail(`Illform entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
          // eslint-disable-next-line no-fallthrough
          case 'enemy': {
            const desc = (enemyTag as any)[tag.qt]?.[tag.q]
            if (!desc) continue
            const { sheet } = desc
            if (!sheet) continue
            if (sheet === 'agg' || sheet === tag.sheet) continue
            fail(`Illform entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
        }
      }
    }
  })
})
