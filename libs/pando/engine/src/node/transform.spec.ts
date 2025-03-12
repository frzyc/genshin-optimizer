import { addCustomOperation } from '../util'
import {
  cmpEq,
  cmpGE,
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
import type { AnyTagFree, NumTagFree } from './transform'
import { compile, compileDiff } from './transform'

const unused = () => {
  throw new Error('unused')
}
addCustomOperation('foo', {
  range: unused,
  monotonicity: unused,
  calc: function (args) {
    const [a, b, _, d] = args as number[]
    return a + b + d
  },
  diff: function (_x, dx) {
    const [da, db, _, dd] = dx
    return da + db + dd
  },
})
addCustomOperation('bar', {
  range: unused,
  monotonicity: unused,
  calc: function (args) {
    const [a, b, c, d] = args as string[]
    return [d, c, b, a].join('/')
  },
})

describe('optimization', () => {
  const read0 = read({ q: '0' })
  const read1 = read({ q: '1' })
  const read2 = read({ q: '2' })
  const x = [
    sum(3, 4, 5, read0), // Multiple consts
    sum(3, sum(4, sum(5)), read1), // Nested consts
    cmpGE(2, 1, read0, read1), // Const branching
    cmpGE(read1, 1, 3, 3), // Futile branching
  ]

  test('compile', () => {
    const compiled = compile(x, 'q', 2)

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
    function runCompile(n: AnyTagFree): number | string {
      return compile([n], '', 0)([])[0]
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
      expect(runCompile(custom('foo', 1, 2, 3, 4))).toEqual(7)
      expect(runCompile(custom('bar', 'a', 'b', 'c', 'd'))).toEqual('d/c/b/a')
    })
  })
  describe('compileDiff computation', () => {
    const [v0, v1, v2] = [10, 20, 1]
    function runDiff(n: NumTagFree): number[] {
      return compileDiff(n, 'q', ['0', '1'], 1)([{ 0: v0, 1: v1, 2: v2 }])
    }
    test('arithmetic', () => {
      expect(runDiff(sum(5, read0, read1, read1, read2))).toEqual([1, 2])
      expect(runDiff(prod(5, read0, read1, read1, read2))).toEqual([
        5 * v1 * v1 * v2,
        5 * v0 * 2 * v1 * v2,
      ])
      expect(runDiff(min(1, read0, read1))).toEqual([0, 0])
      expect(runDiff(min(15, read0, read1))).toEqual([1, 0])
      expect(runDiff(max(1, read0, read1))).toEqual([0, 1])
      expect(runDiff(max(20, read0, read1))).toEqual([0, 0])
      expect(runDiff(sumfrac(read0, 5))).toEqual([5 / (v0 + 5) / (v0 + 5), 0])
      expect(runDiff(sumfrac(read0, read1))).toEqual([
        v1 / (v0 + v1) / (v0 + v1),
        -v0 / (v0 + v1) / (v0 + v1),
      ])
    })
    test('branching', () => {
      // Check all branches
      expect(runDiff(cmpEq(1, 1, read0, read1))).toEqual([1, 0])
      expect(runDiff(cmpEq(1, 2, read0, read1))).toEqual([0, 1])
      expect(() => runDiff(cmpEq(read0, 0, 0, 1))).toThrow()
      expect(() => runDiff(cmpEq(0, read1, 0, 1))).toThrow()
      // Check trichotomy
      expect(runDiff(cmpGE(1, 1, read0, read1))).toEqual([1, 0])
      expect(runDiff(cmpGE(1, 2, read0, read1))).toEqual([0, 1])
      expect(runDiff(cmpGE(2, 1, read0, read1))).toEqual([1, 0])
      expect(() => runDiff(cmpGE(read0, 0, 0, 1))).toThrow()
      expect(() => runDiff(cmpGE(0, read1, 0, 1))).toThrow()
      // Check subscript & lookup
      expect(runDiff(subscript(2, [1, 2, 3, 4]))).toEqual([0, 0])
      expect(() => runDiff(subscript(read0, [1, 2, 3, 4]))).toThrow()
      expect(runDiff(lookup('c', { a: 1, b: read0, c: read1 }))).toEqual([0, 1])
      expect(runDiff(lookup('a', { a: 1, b: read0, c: read1 }))).toEqual([0, 0])
      expect(() => runDiff(lookup(read0, { a: 1, b: 2, c: 3 }))).toThrow()
      // Lookup default branch
      expect(runDiff(lookup('X', { a: 1, b: 2, c: 3, d: 4 }))).toEqual([0, 0])
    })
    test('custom computation', () => {
      expect(runDiff(custom('foo', read0, 2, read1, 4))).toEqual([1, 0])
    })
  })
})
