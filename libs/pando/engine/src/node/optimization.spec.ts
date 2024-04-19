import {
  cmpEq,
  cmpGE,
  constant,
  custom,
  lookup,
  max,
  min,
  prod,
  read,
  subscript,
  sum,
  sumfrac,
} from './construction'
import { applyConst, combineConst, compile, flatten } from './optimization'
import type { AnyNode, OP } from './type'

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
      sum(3, 4, 5, read0), // Does NOT combine multiplpe consts
      sum(3, 4, 5, read1), // Flatten only
      cmpGE(2, 1, read0, read1),
      cmpGE(read1, 1, 3, 3),
    ])
  })
  test('combineConst', () => {
    expect(combineConst(x)).toEqual([
      sum(12, read0), // Does NOT combine multiplpe consts
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
  test('compile', () => {
    const compiled = compile(x, 'q', 2, {})

    // Empty entries
    expect(compiled([{}, {}])).toEqual([12, 12, 0, 3])
    // Entries with non-overlapping values
    expect(compiled([{ 0: 3 }, { 1: 4 }])).toEqual([15, 16, 3, 3])
    // Entries with overlapping values
    expect(
      compiled([
        { 0: 1, 1: 2 },
        { 0: 2, 1: 2 },
      ])
    ).toEqual([15, 16, 3, 3])
  })
  describe('compile computation', () => {
    function runCompile(
      n: AnyNode<Exclude<OP, 'tag' | 'dtag' | 'vtag'>>,
      header = ''
    ): number | string {
      return compile([n], '', 0, {}, header)([])[0]
    }
    test('arithmetic', () => {
      expect(runCompile(sum(1, 2, 3, 4))).toEqual(10)
      expect(runCompile(prod(1, 2, 3, 4))).toEqual(24)
      expect(runCompile(min(1, 2, 3, 4))).toEqual(1)
      expect(runCompile(max(1, 2, 3, 4))).toEqual(4)
      expect(runCompile(sumfrac(1, 2))).toEqual(1 / (1 + 2))
      expect(runCompile(sumfrac(2, 1))).toEqual(2 / (2 + 1))
    })
    test('branching', () => {
      // Check all branches
      expect(runCompile(cmpEq(1, 1, 3, 4))).toEqual(3)
      expect(runCompile(cmpEq(1, 2, 3, 4))).toEqual(4)
      // Check string
      expect(runCompile(cmpEq('a', 'a', 'c', 'd'))).toEqual('c')
      expect(runCompile(cmpEq('a', 'b', 'c', 'd'))).toEqual('d')
      // Check trichotomy
      expect(runCompile(cmpGE(1, 1, 3, 4))).toEqual(3)
      expect(runCompile(cmpGE(1, 2, 3, 4))).toEqual(4)
      expect(runCompile(cmpGE(2, 1, 3, 4))).toEqual(3)
      // Check subscript & lookup
      expect(runCompile(subscript(2, [1, 2, 3, 4]))).toEqual(3)
      expect(runCompile(subscript(2, ['a', 'b', 'c', 'd']))).toEqual('c')
      expect(runCompile(lookup('c', { a: 1, b: 2, c: 3, d: 4 }))).toEqual(3)
      // Lookup default branch
      expect(runCompile(lookup('X', { a: 1, b: 2, c: 3, d: 4 }))).toEqual(NaN)
    })
    test('custom computation', () => {
      expect(
        runCompile(
          custom('foo', 1, 2, 3, 4),
          'function foo(a,b,c,d) { return a+b+d }'
        )
      ).toEqual(7)
      expect(
        runCompile(
          custom('bar', 'a', 'b', 'c', 'd'),
          'function bar(a,b,c,d) { return [d,c,b,a].join("/") }'
        )
      ).toEqual('d/c/b/a')
    })
  })
})
