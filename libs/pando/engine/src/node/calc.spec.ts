import { compileTagMapKeys, compileTagMapValues } from '../tag'
import { Calculator } from './calc'
import { constant, read } from './construction'

const keys = compileTagMapKeys([
  { category: 'cat1', values: new Set([...Array(4)].map((_, i) => `val${i}`)) },
  { category: 'cat2', values: new Set([...Array(4)].map((_, i) => `val${i}`)) },
  { category: 'cat3', values: new Set([...Array(4)].map((_, i) => `val${i}`)) },
])

describe('Calculator', () => {
  it('is initializable with no entry', () => {
    new Calculator(keys)
  })
  it('can process queries matching multiple entries', () => {
    const calc = new Calculator(
      keys,
      compileTagMapValues(keys, [
        { tag: { cat1: 'val1', cat2: 'val1' }, value: constant(3) },
        {
          tag: { cat1: 'val1', cat2: 'val1', cat3: 'val2' },
          value: constant(4),
        },
      ]),
    )

    expect(
      calc
        .gather({ cat1: 'val1', cat2: 'val1', cat3: 'val2' })
        .map((x) => x.val)
        .sort(),
    ).toEqual([3, 4])
    expect(calc.gather({})).toEqual([])
  })
  it('can differentiate between under- and overspecified tags', () => {
    const calc = new Calculator(
      keys,
      compileTagMapValues(keys, [
        { tag: { cat1: 'val1' }, value: constant(3) },
        {
          tag: { cat1: 'val1', cat2: 'val1', cat3: 'val2' },
          value: constant(4),
        },
      ]),
    )

    expect(
      calc.gather({ cat1: 'val1', cat2: 'val1' }).map((x) => x.val),
    ).toEqual([3])
  })
  it('can detect a nonexistent tag category', () => {
    const calc = new Calculator(keys)
    expect(() => calc.gather({ cat4: 'val1' })).toThrow()
  })

  describe('withTag', () => {
    // 1 suffix means it includes `cat1:val1`
    const calc = new Calculator(keys)
    const calc1 = calc.withTag({ cat1: 'val1' })
    it('creates a new calculator', () => {
      expect(calc1).not.toBe(calc)
    })
    it('returns old references on the same tags', () => {
      expect(calc.withTag({})).toBe(calc)
      expect(calc.withTag({ cat1: 'val1' })).toBe(calc1)
      expect(calc1.withTag({ cat1: null })).toBe(calc)
      expect(calc1.withTag({})).toBe(calc1)
      expect(calc1.withTag({ cat1: 'val1' })).toBe(calc1)
    })
    it('shares the same cache', () => {
      // Check references rather than values
      const ref = calc.compute(read({}))
      const ref1 = calc.compute(read({ cat1: 'val1' }))
      const refCalc1 = calc1.compute(read({ cat1: null }))
      const ref1Calc1 = calc1.compute(read({}))
      expect(ref1Calc1).not.toBe(ref)
      expect(ref1Calc1).toBe(ref1)
      expect(refCalc1).toBe(ref)
    })
  })
})
