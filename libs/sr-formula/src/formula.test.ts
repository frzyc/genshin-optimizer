import { dumpFile } from '@genshin-optimizer/pipeline'
import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr-consts'
import {
  compileTagMapValues,
  constant,
  read,
  reread
} from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
import type { TaggedFormulas } from './data/util'
import { dependencyString } from './debug'

describe('character test', () => {
  it.each([
    [1, 0, 69.6, 78, 144, 101],
    [20, 0, 135.72, 152.1, 280.8, 101],
    [20, 1, 163.56, 183.3, 338.4, 101],
    [80, 6, 511.56, 573.3, 1058.4, 101],
  ])('Calculate character base stats', (lvl, ascension, atk, def, hp, spd) => {
    const charKey: CharacterKey = 'March7th'
    const data: TaggedFormulas = [
      { tag: { src: charKey, q: 'lvl', }, value: constant(lvl) },
      {
        tag: { src: charKey, q: 'ascension', },
        value: constant(ascension),
      },
      {
        tag: { st: "char" },
        value: reread({ st: null, src: charKey })
      }
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const commonTags = { st: "char", qt: 'base' }

    expect(
      calc.compute(
        read({ ...commonTags, q: 'atk' }, undefined)
      ).val
    ).toBeCloseTo(atk)
    expect(
      calc.compute(
        read({ ...commonTags, q: 'def' }, undefined)
      ).val
    ).toBeCloseTo(def)
    expect(
      calc.compute(
        read({ ...commonTags, q: 'hp' }, undefined)
      ).val
    ).toBeCloseTo(hp)
    expect(
      calc.compute(
        read({ ...commonTags, q: 'spd' }, undefined)
      ).val
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
    const data: TaggedFormulas = [
      { tag: { src: lcKey, q: 'lvl' }, value: constant(lvl) },
      {
        tag: { src: lcKey, q: 'ascension' },
        value: constant(ascension),
      },
      {
        tag: { st: "lightcone" },
        value: reread({ st: null, src: lcKey })
      }
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const commonTags = { st: "lightcone", qt: 'base' }

    expect(
      calc.compute(
        read({ ...commonTags, q: 'atk' }, undefined)
      ).val
    ).toBeCloseTo(atk)
    expect(
      calc.compute(
        read({ ...commonTags, q: 'def' }, undefined)
      ).val
    ).toBeCloseTo(def)
    expect(
      calc.compute(
        read({ ...commonTags, q: 'hp' }, undefined)
      ).val
    ).toBeCloseTo(hp)
  })
})

describe('char+lightcone test', () => {
  it('calculate base stats', () => {
    const charKey: CharacterKey = 'March7th'
    const lcKey: LightConeKey = 'Amber'

    const data: TaggedFormulas = [
      { tag: { src: charKey, q: 'lvl' }, value: constant(1) },
      { tag: { src: charKey, q: 'ascension' }, value: constant(0) },
      { tag: { src: lcKey, q: 'lvl' }, value: constant(1) },
      { tag: { src: lcKey, q: 'ascension' }, value: constant(0) },
      {
        tag: { st: "char" },
        value: reread({ st: null, src: charKey })
      },
      {
        tag: { st: "lightcone" },
        value: reread({ st: null, src: lcKey })
      },
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    expect(
      calc.compute(read({ st: "total", qt: 'base', q: 'atk' }, 'sum')).val
    ).toBeCloseTo(81.6)
  })
})
