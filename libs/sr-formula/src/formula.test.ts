import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr-consts'
import {
  compileTagMapValues,
  constant,
  read,
} from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
import type { TaggedFormulas } from './data/util'
import { handleLightConeGen } from './data/lightcone'

describe('character test', () => {
  it.each([
    [1, 0, 69.6, 78, 144, 101],
    [20, 0, 135.72, 152.1, 280.8, 101],
    [20, 1, 163.56, 183.3, 338.4, 101],
    [80, 6, 511.56, 573.3, 1058.4, 101],
  ])('Calculate character base stats', (lvl, ascension, atk, def, hp, spd) => {
    const charKey: CharacterKey = 'March7th'
    const data: TaggedFormulas = [
      { tag: { src: charKey, dest: charKey, q: 'lvl' }, value: constant(lvl) },
      { tag: { src: charKey, dest: charKey, q: 'ascension' }, value: constant(ascension) },
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    expect(
      calc.compute(read({ src: charKey, dest: charKey, qt: 'base', q: 'atk' }, undefined)).val
    ).toBeCloseTo(atk)
    expect(
      calc.compute(read({ src: charKey, dest: charKey, qt: 'base', q: 'def' }, undefined)).val
    ).toBeCloseTo(def)
    expect(
      calc.compute(read({ src: charKey, dest: charKey, qt: 'base', q: 'hp' }, undefined)).val
    ).toBeCloseTo(hp)
    expect(
      calc.compute(read({ src: charKey, dest: charKey, qt: 'base', q: 'spd' }, undefined)).val
    ).toBeCloseTo(spd)
  })
})

describe('lightcone test', () => {
  it.each([
    [1, 0, 14.4, 12, 38.4],
    [20, 0, 55.44, 46.2, 147.84],
    [20, 1, 72.72, 60.6, 193.92],
  ])('Calculate lightcone base stats', (lvl, ascension, atk, def, hp) => {
    const lcKey: LightConeKey = 'Arrows'
    const charKey: CharacterKey = 'March7th'
    const data: TaggedFormulas = [
      ...handleLightConeGen(lcKey, charKey),
      { tag: { src: lcKey, dest: charKey, q: 'lvl' }, value: constant(lvl) },
      { tag: { src: lcKey, dest: charKey, q: 'ascension' }, value: constant(ascension) },
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    expect(
      calc.compute(read({ src: lcKey, dest: charKey, qt: 'base', q: 'atk' }, undefined)).val
    ).toBeCloseTo(atk)
    expect(
      calc.compute(read({ src: lcKey, dest: charKey, qt: 'base', q: 'def' }, undefined)).val
    ).toBeCloseTo(def)
    expect(
      calc.compute(read({ src: lcKey, dest: charKey, qt: 'base', q: 'hp' }, undefined)).val
    ).toBeCloseTo(hp)
  })
})
