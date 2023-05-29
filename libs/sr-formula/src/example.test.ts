import {
  compileTagMapValues,
  constant,
  read,
  sum,
} from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
import type { TaggedFormulas } from './data/util'
import { dependencyString, listDependencies } from './debug'
import { translate } from './formulaText'

// This test acts as an example usage. It's mostly sufficient to test that the code
// doesn't crash. Any test for correct values should go to `correctness` tests.
// Should a test here fail, extract a minimized version to `correctness` test.
describe('example', () => {
  const data: TaggedFormulas = [
      // TODO: Add team-specific data; members, member levels, etc.

      /* R1 */ { tag: { cat1: 'value1' }, value: constant(4) },
      /* R2 */ { tag: { cat1: 'value1', cat2: 'value1' }, value: constant(1) },
      /* R3 */ {
        tag: { cat1: 'value2' },
        value: read({ cat1: 'value1' }, 'sum'),
      },
    ],
    calc = new Calculator(keys, values, compileTagMapValues(keys, data))

  test('calculate stats', () => {
    expect(calc.compute(read({ cat1: 'value1' }, undefined)).val).toEqual(4) // R1
    expect(
      calc.compute(read({ cat1: 'value1', cat2: 'value1' }, 'min')).val
    ).toEqual(1) // min(R1, R2)
    expect(
      calc.compute(read({ cat1: 'value1', cat2: 'value1' }, 'max')).val
    ).toEqual(4) // max(R1, R2)
    expect(
      calc.compute(sum(read({ cat1: 'value1', cat2: 'value1' }, 'max'), 5)).val
    ).toEqual(9) // max(R1, R2) + 5
    expect(
      calc.compute(read({ cat1: 'value2', cat2: 'value1' }, undefined)).val
    ).toEqual(5) // R3 (= R1 + R2)
    expect(
      calc.compute(read({ cat1: 'value2', cat2: 'value1' }, undefined)).val
    ).toEqual(5) // R3 with cat2:value1 (= R1 + R2)
    expect(calc.compute(read({ cat1: 'value2' }, undefined)).val).toEqual(4) // R3 (= R1)
  })

  test('Debug util functions', () => {
    // `dependencyString` and `listDependencies` are more-or-less the same function
    // with `dependencyString` being somewhat cleaner (but contain less information)
    console.log(
      dependencyString(
        read({ cat1: 'value2', cat2: 'value1' }, undefined),
        calc
      )
    )
    console.log(listDependencies({ cat1: 'value2', cat2: 'value1' }, calc))
  })
  test('Formula text', () => {
    // Object used to construct formula text. In particular `name` and `formula` fields
    const { name, formula } = translate(
      calc.compute(
        sum(
          read({ cat1: 'value2' }, undefined),
          read({ cat1: 'value2', cat2: 'value1' }, undefined),
          4
        )
      )
    )
    console.log('Name:', name)
    console.log('Formula:', formula)
  })
})
