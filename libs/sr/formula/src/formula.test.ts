import { compileTagMapValues } from '@genshin-optimizer/pando/engine'
import type {
  AscensionKey,
  CharacterKey,
  LightConeKey,
} from '@genshin-optimizer/sr/consts'
import { charData, lightConeData, withMember } from '.'
import { Calculator } from './calculator'
import { keys, values } from './data'
import { convert, selfTag, type TagMapNodeEntries } from './data/util'

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
        'member0',
        ...charData({
          level: lvl,
          ascension: ascension as AscensionKey,
          key: charKey,
          eidolon: 0,
          basic: 0,
          skill: 0,
          ult: 0,
          talent: 0,
          bonusAbilities: {},
          statBoosts: {},
        })
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    const member0 = convert(selfTag, { member: 'member0', et: 'self' })
    expect(calc.compute(member0.final.atk).val).toBeCloseTo(atk)
    expect(calc.compute(member0.final.def).val).toBeCloseTo(def)
    expect(calc.compute(member0.final.hp).val).toBeCloseTo(hp)
    expect(calc.compute(member0.final.spd).val).toBeCloseTo(spd)
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
        'member0',
        ...charData({
          level: 1,
          ascension: 0,
          key: 'March7th',
          eidolon: 0,
          basic: 0,
          skill: 0,
          ult: 0,
          talent: 0,
          bonusAbilities: {},
          statBoosts: {},
        }),
        ...lightConeData({
          key: lcKey,
          level: lvl,
          ascension: ascension as AscensionKey,
          superimpose: 1,
          lock: false,
          location: 'March7th',
        })
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    const member0 = convert(selfTag, { member: 'member0', et: 'self' })
    expect(calc.compute(member0.base.atk.src('lightCone')).val).toBeCloseTo(atk)
    expect(calc.compute(member0.base.def.src('lightCone')).val).toBeCloseTo(def)
    expect(calc.compute(member0.base.hp.src('lightCone')).val).toBeCloseTo(hp)
  })
})

describe('char+lightCone test', () => {
  it('calculate base stats', () => {
    const charKey: CharacterKey = 'March7th'
    const lcKey: LightConeKey = 'Amber'

    const data: TagMapNodeEntries = [
      ...withMember(
        'member0',
        ...charData({
          level: 1,
          ascension: 0,
          key: charKey,
          eidolon: 0,
          basic: 0,
          skill: 0,
          ult: 0,
          talent: 0,
          bonusAbilities: {},
          statBoosts: {},
        }),
        ...lightConeData({
          key: lcKey,
          level: 1,
          ascension: 0,
          superimpose: 1,
          lock: false,
          location: 'March7th',
        })
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const member0 = convert(selfTag, { member: 'member0', et: 'self' })
    expect(calc.compute(member0.final.atk).val).toBeCloseTo(81.6)
  })
})
