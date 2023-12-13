import { compileTagMapValues, reread } from '@genshin-optimizer/pando'
import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr-consts'
import { Calculator } from './calculator'
import { keys, values } from './data'
import { self, selfBuff, type TagMapNodeEntries } from './data/util'

describe('character test', () => {
  it.each([
    [1, 0, 69.6, 78, 144, 101],
    [20, 0, 135.72, 152.1, 280.8, 101],
    [20, 1, 163.56, 183.3, 338.4, 101],
    [80, 6, 511.56, 573.3, 1058.4, 101],
  ])('Calculate character base stats', (lvl, ascension, atk, def, hp, spd) => {
    const charKey: CharacterKey = 'March7th'
    const data: TagMapNodeEntries = [
      selfBuff.char.lvl.add(lvl),
      selfBuff.char.ascension.add(ascension),
      {
        tag: { src: 'char' },
        value: reread({ src: charKey }),
      },
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    expect(calc.compute(self.stat.atk.src('char')).val).toBeCloseTo(atk)
    expect(calc.compute(self.stat.def.src('char')).val).toBeCloseTo(def)
    expect(calc.compute(self.stat.hp.src('char')).val).toBeCloseTo(hp)
    expect(calc.compute(self.stat.spd.src('char')).val).toBeCloseTo(spd)
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
      selfBuff.lightCone.lvl.add(lvl),
      selfBuff.lightCone.ascension.add(ascension),
      {
        tag: { src: 'lightCone' },
        value: reread({ src: lcKey }),
      },
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

    expect(calc.compute(self.stat.atk.src('lightCone')).val).toBeCloseTo(atk)
    expect(calc.compute(self.stat.def.src('lightCone')).val).toBeCloseTo(def)
    expect(calc.compute(self.stat.hp.src('lightCone')).val).toBeCloseTo(hp)
  })
})

describe('char+lightCone test', () => {
  it('calculate base stats', () => {
    const charKey: CharacterKey = 'March7th'
    const lcKey: LightConeKey = 'Amber'

    const data: TagMapNodeEntries = [
      self.char.lvl.add(1),
      self.char.ascension.add(0),
      self.lightCone.lvl.add(1),
      self.lightCone.ascension.add(0),
      {
        tag: { src: 'char' },
        value: reread({ src: charKey }),
      },
      {
        tag: { src: 'lightCone' },
        value: reread({ src: lcKey }),
      },
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    expect(calc.compute(self.stat.atk).val).toBeCloseTo(81.6)
  })
})
