import { compileTagMapValues } from '../tag'
import { compileTagMapKeys } from '../tag/keyCompilation'
import { Calculator } from './calc'
import { constant } from './construction'

const tags = [4, 4, 4].flatMap((v, i) =>
  [...Array(v)].map((_, j) => ({ [`cat${i + 1}`]: `val${j + 1}` }))
)
const keys = compileTagMapKeys(tags, [])

describe('Calculator', () => {
  it('is initializable with no entry', () => {
    new Calculator(keys)
  })
  it('can process queries matching multiple entries', () => {
    const calc = new Calculator(keys, compileTagMapValues(keys, [
      { tag: { cat1: 'val1', cat2: 'val1' }, value: constant(3) },
      { tag: { cat1: 'val1', cat2: 'val1', cat3: 'val2' }, value: constant(4) }
    ]))

    expect(calc.get({ cat1: 'val1', cat2: 'val1', cat3: 'val2' }).map(x => x.val).sort()).toEqual([3, 4])
    expect(calc.get({})).toEqual([])
  })
  it('can differentiate between under- and overspecified tags', () => {
    const calc = new Calculator(keys, compileTagMapValues(keys, [
      { tag: { cat1: 'val1' }, value: constant(3) },
      { tag: { cat1: 'val1', cat2: 'val1', cat3: 'val2' }, value: constant(4) }
    ]))

    expect(calc.get({ cat1: 'val1', cat2: 'val1' }).map(x => x.val)).toEqual([3])
  })
  it('can detect a nonexistent tag category', () => {
    const calc = new Calculator(keys)
    expect(() => calc.get({ cat4: 'val1' })).toThrow()
  })
})
