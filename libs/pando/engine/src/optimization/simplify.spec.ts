import { cmpGE, constant, read, sum } from '../node'
import { applyConst, combineConst, flatten } from './simplify'

describe('optimization', () => {
  const read0 = read({ q: '0' }, undefined)
  const read1 = read({ q: '1' }, undefined)
  const x = [
    sum(3, 4, 5, read0), // Multiple consts
    sum(3, sum(4, sum(5)), read1), // Nested consts
    cmpGE(2, 1, read0, read1), // Const branching
    cmpGE(read1, 1, 3, 3), // Futile branching
  ]

  test('flatten', () => {
    expect(flatten(x)).toEqual([
      sum(3, 4, 5, read0), // Does NOT combine multiple consts
      sum(3, 4, 5, read1), // Flatten only
      cmpGE(2, 1, read0, read1),
      cmpGE(read1, 1, 3, 3),
    ])
  })
  test('combineConst', () => {
    expect(combineConst(x)).toEqual([
      sum(12, read0), // Does NOT combine multiple consts
      sum(3, sum(4, sum(5)), read1), // Ignore nested operations
      cmpGE(2, 1, read0, read1),
      cmpGE(read1, 1, 3, 3),
    ])
  })
  test('applyConst', () => {
    expect(applyConst(x)).toEqual([
      sum(3, 4, 5, read0), // Does NOT combine if it does not result in a const
      sum(3, 9, read1), // Apply only "constant" `sum`
      read0,
      constant(3),
    ])
  })
})
