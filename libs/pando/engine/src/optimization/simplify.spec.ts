import { cmpEq, cmpGE, cmpNE, read, sum } from '../node'
import { combineConst, deduplicate, flatten } from './simplify'

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
  test('deduplicate', () => {
    const [s0, s1, m0, m1, t0, t0dup, t1, t2] = deduplicate([
      // sum
      sum(12, read0),
      sum(read0, 12),
      // match
      cmpEq(read0, read1, 1, 0),
      cmpNE(read1, read0, 0, 1),
      // threshold
      cmpGE(read0, read1, 0, 1),
      cmpGE(read0, read1, 0, 1),
      cmpGE(read1, read0, 0, 1),
      cmpGE(read0, read1, 1, 0),
    ])
    expect(s0).toBe(s1)
    expect(m0).toBe(m1)
    expect(t0).toBe(t0dup)
    expect(t0).not.toBe(t1)
    expect(t0).not.toBe(t2)
    expect(t1).not.toBe(t2)
  })
})
