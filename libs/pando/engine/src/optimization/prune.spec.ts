import type { NumNode, OP as TaggedOP } from '../node'
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
} from '../node'
import { addCustomOperation } from '../util'
import { pruneBranches, pruneRange, reaffine, State } from './prune'

type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>

const r0 = read({ q: 'c0' }, undefined)
const r1 = read({ q: 'c1' }, undefined)
const r2 = read({ q: 'c2' }, undefined)

addCustomOperation('sqrt', {
  range: ([r]) => {
    const candidates = [r.min * r.min, r.max * r.max]
    if (r.min <= 0 && 0 <= r.max) candidates.push(0)
    return { min: Math.min(...candidates), max: Math.max(...candidates) }
  },
  monotonicity: ([r]) => {
    const result = { inc: true, dec: true }
    if (r.min < 0) result.inc = false
    if (r.max > 0) result.dec = false
    return [result]
  },
  calc: ([x]) => (x as number) * (x as number),
})

describe('pruning', () => {
  const builds = [
    [
      { c0: 0, c1: 3, c2: 4 },
      { c0: 6, c1: 2, c2: 6 },
      { c0: 10, c1: 1, c2: 6 },
    ],
  ]
  test('reaffine', () => {
    const nodes = [
      prod(7, sum(r0, prod(3, r1), 6), sum(r0, r1, 2)),
      constant(11),
    ]
    const state = new State(nodes, builds, 'q')
    state.progress = false
    reaffine(state)
    expect(state.progress).toBe(true)
    // Normally the reaffined keys are unspecified, but since the current
    // algorithm is deterministic, we can just run it and note the keys
    expect(state.candidates).toEqual([[{}, { c0: 3, c1: 5 }, { c0: 4, c1: 8 }]])
    // reaffine nodes into different keys (c0 and c1, again, with different values)
    // and leave the constant nodes alone
    expect(state.nodes).toEqual([
      prod(7, sum(15, r0), sum(5, r1)),
      constant(11),
    ])
  })
  test('pruneBranches', () => {
    const nodes = [
      cmpGE(r2, 4, r0, r1),
      cmpGE(r2, 7, r0, r1),
      cmpGE(r1, 2, r0, r1), // can't prune
      min(r0, r1, r2),
      max(r0, r1, r2),
      cmpEq(1, 1, r0, r1),
      lookup(subscript(2, ['a', 'b', 'c']), { a: 0, b: 11, c: 22 }),
    ]
    const state = new State(nodes, builds, 'q')
    state.progress = false
    pruneBranches(state)
    expect(state.progress).toBe(true)
    expect(state.nodes.length).toEqual(nodes.length)
    expect(state.nodes[0]).toBe(r0)
    expect(state.nodes[1]).toBe(r1)
    expect(state.nodes[2]).toBe(nodes[2])
    expect(state.nodes[3]).toEqual(min(r0, r1))
    expect(state.nodes[4]).toEqual(max(r0, r2))
    expect(state.nodes[5]).toBe(r0)
    expect(state.nodes[6]).toEqual(constant(22))
  })
  test('pruneRanges', () => {
    const nodes = [r0, r1, prod(r1, r2), sum(1, r2)]
    const minimum = [5, 0]
    const state = new State(nodes, builds, 'q')
    state.progress = false
    const newMinimum = pruneRange(state, minimum)
    expect(state.progress).toBe(true)
    expect(state.nodes.length).toEqual(3)
    expect(state.nodes[0]).toBe(nodes[0])
    // Skip `nodes[1]` because the minimum is always met
    expect(state.nodes[1]).toBe(nodes[2])
    expect(state.nodes[2]).toBe(nodes[3])
    expect(newMinimum).toEqual([minimum[0]])

    expect(state.candidates.length).toEqual(1)
    expect(state.candidates[0].length).toEqual(2)
    expect(state.candidates[0][0]).toBe(builds[0][1])
    expect(state.candidates[0][1]).toBe(builds[0][2])
  })
})
describe('state', () => {
  const nodes = [
    sum(r0, r1, r2),
    prod(r0, r1, r2),
    min(r0, r1, r2),
    max(r0, r1, r2),
    cmpEq(r2, 3, r0, r1),
    cmpGE(r2, 3, r0, r1),
    sumfrac(r0, r1),
    subscript(r0, [44, 2, 3, 4, 5, 22, 7, 8]),
    lookup(subscript(r0, ['a', 'b', 'c']), { a: r1, b: r2, c: 6 }),
    custom('sqrt', sum(r0, -3)),
  ]

  const builds: Record<string, number>[][] = [
    [
      { c1: 10, c2: 4 },
      { c0: 3, c1: 9, c2: 4 },
    ],
    [
      { c0: 4, c1: 1, c2: 4 },
      { c0: 2, c2: 4 },
    ],
  ]
  const state = new State(nodes, builds, 'q')

  test('comp ranges', () => {
    const { compRanges } = state
    expect(compRanges.length).toEqual(builds.length)
    expect(compRanges[0]).toEqual({
      c0: { min: 0, max: 3 },
      c1: { min: 9, max: 10 },
      c2: { min: 4, max: 4 },
    })
    expect(compRanges[1]).toEqual({
      c0: { min: 2, max: 4 },
      c1: { min: 0, max: 1 },
      c2: { min: 4, max: 4 },
    })
  })
  test('node ranges', () => {
    const { nodeRanges } = state
    expect(nodeRanges.get(r0)).toEqual({ min: 2, max: 7 })
    expect(nodeRanges.get(r1)).toEqual({ min: 9, max: 11 })
    expect(nodeRanges.get(r2)).toEqual({ min: 8, max: 8 })
    expect(nodeRanges.get(nodes[0])).toEqual({ min: 19, max: 26 }) // sum(r0, r1, r2)
    expect(nodeRanges.get(nodes[1])).toEqual({ min: 144, max: 616 }) // prod(r0, r1, r2)
    expect(nodeRanges.get(nodes[2])).toEqual({ min: 2, max: 7 }) // min(r0, r1, r2)
    expect(nodeRanges.get(nodes[3])).toEqual({ min: 9, max: 11 }) // max(r0, r1, r2)
    expect(nodeRanges.get(nodes[4])).toEqual({ min: 2, max: 11 }) // r2 == 3 ? r0 : r1
    expect(nodeRanges.get(nodes[5])).toEqual({ min: 2, max: 11 }) // r2 >= 3 ? r0 : r1
    expect(nodeRanges.get(nodes[6])).toEqual({ min: 2 / 13, max: 7 / 16 }) // r0 / (r0 + r1)
    expect(nodeRanges.get(nodes[7])).toEqual({ min: 3, max: 22 }) // array[r0]
    expect(nodeRanges.get(nodes[8])).toEqual({ min: 6, max: 11 }) // lookup
    expect(nodeRanges.get(nodes[9])).toEqual({ min: 0, max: 16 }) // (r0 - 3)^2
  })
  describe('monotonicity', () => {
    // False negative is fine (inc/dec is `false` when it should be `true`).
    // False positive is not (inc/dec is `true` when it should be `false`).
    // So make sure to check all cases that should return `false`, but we
    // can skip some `true` cases that aren't handled yet

    function flip(n: NumNode<OP>, inc: boolean): NumNode<OP> {
      return inc ? n : sumfrac(10000, n)
    }

    for (const op of [sum, min, max])
      describe(op.name, () => {
        for (const inc of [true, false])
          test(inc ? 'inc' : 'dec', () => {
            const n = op(r0, r1, r2)
            const m = new State([flip(n, inc)], builds, 'q').monotonicities
            expect(m.get('c0')).toEqual({ inc, dec: !inc })
            expect(m.get('c1')).toEqual({ inc, dec: !inc })
            expect(m.get('c2')).toEqual({ inc, dec: !inc })
          })
      })
    describe('non-zero prod', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n0 = prod(r0, r1, r2)
          const m0 = new State([flip(n0, inc)], builds, 'q').monotonicities
          expect(m0.get('c0')).toEqual({ inc, dec: !inc })
          expect(m0.get('c1')).toEqual({ inc, dec: !inc })
          expect(m0.get('c2')).toEqual({ inc, dec: !inc })

          const n1 = prod(sum(r0, -8), r1, r2)
          const m1 = new State([flip(n1, inc)], builds, 'q').monotonicities
          expect(m1.get('c0')).toEqual({ inc, dec: !inc })
          expect(m1.get('c1')).toEqual({ inc: !inc, dec: inc })
          expect(m1.get('c2')).toEqual({ inc: !inc, dec: inc })

          const n2 = prod(sum(r0, -8), sum(r1, -12), r2)
          const m2 = new State([flip(n2, inc)], builds, 'q').monotonicities
          expect(m2.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(m2.get('c1')).toEqual({ inc: !inc, dec: inc })
          expect(m2.get('c2')).toEqual({ inc, dec: !inc })

          const n3 = prod(sum(r0, -8), sum(r1, -12), sum(r2, -9))
          const m3 = new State([flip(n3, inc)], builds, 'q').monotonicities
          expect(m3.get('c0')).toEqual({ inc, dec: !inc })
          expect(m3.get('c1')).toEqual({ inc, dec: !inc })
          expect(m3.get('c2')).toEqual({ inc, dec: !inc })
        })
    })
    describe('maybe-zero prod', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n1 = prod(sum(r0, -7), r1, r2)
          const m1 = new State([flip(n1, inc)], builds, 'q').monotonicities
          expect(m1.get('c0')?.[inc ? 'dec' : 'inc']).toEqual(false)
          expect(m1.get('c1')?.[inc ? 'inc' : 'dec']).toEqual(false)
          expect(m1.get('c2')?.[inc ? 'inc' : 'dec']).toEqual(false)

          const n2 = prod(sum(r0, -7), sum(r1, -11), r2)
          const m2 = new State([flip(n2, inc)], builds, 'q').monotonicities
          expect(m2.get('c0')?.[inc ? 'inc' : 'dec']).toEqual(false)
          expect(m2.get('c1')?.[inc ? 'inc' : 'dec']).toEqual(false)
          expect(m2.get('c2')?.[inc ? 'dec' : 'inc']).toEqual(false)

          const n3 = prod(sum(r0, -7), sum(r1, -11), sum(r2, -8))
          const m3 = new State([flip(n3, inc)], builds, 'q').monotonicities
          expect(m3.get('c0')?.[inc ? 'dec' : 'inc']).toEqual(false)
          expect(m3.get('c1')?.[inc ? 'dec' : 'inc']).toEqual(false)
          expect(m3.get('c2')?.[inc ? 'dec' : 'inc']).toEqual(false)

          const n4 = prod(sum(r0, -4), r1, r2) // r0 can be neg/zero/pos
          const m4 = new State([flip(n4, inc)], builds, 'q').monotonicities
          expect(m4.get('c0')?.[inc ? 'dec' : 'inc']).toEqual(false)
          expect(m4.get('c1')).toEqual({ inc: false, dec: false })
          expect(m4.get('c2')).toEqual({ inc: false, dec: false })
        })
    })
    // r0 < r2 < r1
    describe('match', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n = cmpEq(r0, 3, r1, r2)
          const m = new State([flip(n, inc)], builds, 'q').monotonicities
          expect(m.get('c0')).toEqual({ inc: false, dec: false })
          expect(m.get('c1')).toEqual({ inc, dec: !inc })
          expect(m.get('c2')).toEqual({ inc, dec: !inc })
        })
    })
    describe('thres', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n1 = cmpGE(r0, 3, r1, r2)
          const m1 = new State([flip(n1, inc)], builds, 'q').monotonicities
          expect(m1.get('c0')).toEqual({ inc, dec: !inc })
          expect(m1.get('c1')).toEqual({ inc, dec: !inc })
          expect(m1.get('c2')).toEqual({ inc, dec: !inc })

          const n2 = cmpGE(r0, 3, r2, r1)
          const m2 = new State([flip(n2, inc)], builds, 'q').monotonicities
          expect(m2.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(m2.get('c1')).toEqual({ inc, dec: !inc })
          expect(m2.get('c2')).toEqual({ inc, dec: !inc })

          const n3 = cmpGE(3, r0, r1, r2)
          const m3 = new State([flip(n3, inc)], builds, 'q').monotonicities
          expect(m3.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(m3.get('c1')).toEqual({ inc, dec: !inc })
          expect(m3.get('c2')).toEqual({ inc, dec: !inc })

          const n4 = cmpGE(3, r0, r2, r1)
          const m4 = new State([flip(n4, inc)], builds, 'q').monotonicities
          expect(m4.get('c0')).toEqual({ inc, dec: !inc })
          expect(m4.get('c1')).toEqual({ inc, dec: !inc })
          expect(m4.get('c2')).toEqual({ inc, dec: !inc })
        })
    })
    describe('sumfrac', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const npos = sumfrac(r0, r1)
          const mpos = new State([flip(npos, inc)], builds, 'q').monotonicities
          expect(mpos.get('c0')).toEqual({ inc, dec: !inc })
          expect(mpos.get('c1')).toEqual({ inc: !inc, dec: inc })

          const negx = sumfrac(sum(r0, -8), r1)
          const mnegx = new State([flip(negx, inc)], builds, 'q').monotonicities
          expect(mnegx.get('c0')).toEqual({ inc, dec: !inc })
          expect(mnegx.get('c1')).toEqual({ inc, dec: !inc })

          const negc = sumfrac(r0, sum(r1, -12))
          const mnegc = new State([flip(negc, inc)], builds, 'q').monotonicities
          expect(mnegc.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(mnegc.get('c1')).toEqual({ inc: !inc, dec: inc })

          const degen = sumfrac(r0, prod(-1, r0))
          const mdegen = new State([flip(degen, inc)], builds, 'q')
            .monotonicities
          expect(mdegen.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
    describe('lookup', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const table = { a: r1, b: r2, c: 6 }
          const n = lookup(subscript(r0, ['a', 'b', 'c']), table)
          const m = new State([flip(n, inc)], builds, 'q').monotonicities
          expect(m.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
    describe('subscript', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n0 = subscript(r0, [33, 44, 1, 2, 3])
          const m0 = new State([flip(n0, inc)], builds, 'q').monotonicities
          expect(m0.get('c0')).toEqual({ inc, dec: !inc })

          const n1 = subscript(r0, [33, 44, 4, 3, 2])
          const m1 = new State([flip(n1, inc)], builds, 'q').monotonicities
          expect(m1.get('c0')).toEqual({ inc: !inc, dec: inc })

          const n2 = subscript(r0, [33, 44, 4, 3, 5])
          const m2 = new State([flip(n2, inc)], builds, 'q').monotonicities
          expect(m2.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
    describe('custom', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const pos = custom('sqrt', r0)
          const mpos = new State([flip(pos, inc)], builds, 'q').monotonicities
          expect(mpos.get('c0')).toEqual({ inc, dec: !inc })

          const neg = custom('sqrt', sum(r0, -8))
          const mneg = new State([flip(neg, inc)], builds, 'q').monotonicities
          expect(mneg.get('c0')).toEqual({ inc: !inc, dec: inc })

          const zero = custom('sqrt', sum(r0, -4))
          const mzero = new State([flip(zero, inc)], builds, 'q').monotonicities
          expect(mzero.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
  })
})
