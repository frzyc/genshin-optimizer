import type { NumTagFree } from '../node'
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
import { type Monotonicity, addCustomOperation } from '../util'
import { State, pruneBranches, pruneRange, reaffine } from './prune'

const r0 = read({ q: 'c0' })
const r1 = read({ q: 'c1' })
const r2 = read({ q: 'c2' })
const r4 = read({ q: 'c4' })

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
  const candidates = [
    [
      { id: 1, c0: 0, c1: 3, c2: 4 },
      { id: 2, c0: 6, c1: 2, c2: 6 },
      { id: 3, c0: 10, c1: 1, c2: 6 },
    ],
  ]
  test('reaffine', () => {
    const nodes = [
      prod(7, sum(r0, prod(3, r1), 6), sum(r0, r1, 2)),
      constant(11),
      sum(r0, prod(3, 4, 5)),
      sum(r0, sum(3, 4, 5)),
      sum(r0, 77),
    ]
    const state = new State(nodes, [], candidates, 'q')
    state.progress = false
    reaffine(state)
    expect(state.progress).toBe(true)
    // Normally the reaffined keys are unspecified, but since the current
    // algorithm is deterministic, we can just run it and note the keys
    // [c0, c1, c4] = [c0 + 3c1, c0 + c1, c0]
    expect(state.candidates).toEqual([
      [
        { id: 1, c0: 9, c1: 3, c4: 0 },
        { id: 2, c0: 12, c1: 8, c4: 6 },
        { id: 3, c0: 13, c1: 11, c4: 10 },
      ],
    ])
    expect(state.nodes).toEqual([
      prod(7, sum(6, r0), sum(2, r1)),
      constant(11),
      sum(60, r4),
      sum(12, r4),
      sum(77, r4),
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
    const state = new State(nodes, [], candidates, 'q')
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
    const nodes = [sum(1, r2), r0, r1, prod(r1, r2)]
    const minimum = [-Infinity, 5, 0]
    const state = new State(nodes, minimum, candidates, 'q')
    state.progress = false
    pruneRange(state, 1)
    expect(state.progress).toBe(true)
    // Keep `nodes[0]` because it's a "required" constraint
    // Skip `nodes[2]` because the minimum is always met
    expect(state.nodes).toEqual([nodes[0], nodes[1], nodes[3]])
    expect(state.minimum).toEqual([minimum[0], minimum[1]])

    expect(state.candidates.length).toEqual(1)
    expect(state.candidates[0].length).toEqual(2)
    expect(state.candidates[0][0]).toBe(candidates[0][1])
    expect(state.candidates[0][1]).toBe(candidates[0][2])
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

  const candidates = [
    [
      { id: 1, c1: 10, c2: 4 },
      { id: 2, c0: 3, c1: 9, c2: 4 },
    ],
    [
      { id: 3, c0: 4, c1: 1, c2: 4 },
      { id: 4, c0: 2, c2: 4 },
    ],
  ]
  const state = new State(nodes, [], candidates, 'q')

  test('comp ranges', () => {
    const { cndRanges } = state
    expect(cndRanges.length).toEqual(candidates.length)
    expect(cndRanges[0]).toEqual({
      c0: { min: 0, max: 3 },
      c1: { min: 9, max: 10 },
      c2: { min: 4, max: 4 },
      id: { min: 1, max: 2 },
    })
    expect(cndRanges[1]).toEqual({
      c0: { min: 2, max: 4 },
      c1: { min: 0, max: 1 },
      c2: { min: 4, max: 4 },
      id: { min: 3, max: 4 },
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

    function flip(n: NumTagFree, inc: boolean): NumTagFree {
      return inc ? n : sumfrac(10000, n)
    }
    function getMonotonicity(node: NumTagFree): Map<string, Monotonicity> {
      return new State([node], [-Infinity], candidates, 'q').monotonicities
    }

    test('only on constraint nodes', () => {
      const nodes = [r0, prod(-1, r0)]
      {
        // only the first node affect monotonicity
        const m = new State(nodes, [-Infinity], candidates, 'q').monotonicities
        expect(m).toEqual(new Map([['c0', { inc: true, dec: false }]]))
      }
      {
        // both nodes affect monotonicity
        const m = new State(nodes, [-Infinity, -Infinity], candidates, 'q')
          .monotonicities
        expect(m).toEqual(new Map([['c0', { inc: false, dec: false }]]))
      }
    })
    for (const op of [sum, min, max])
      describe(op.name, () => {
        for (const inc of [true, false])
          test(inc ? 'inc' : 'dec', () => {
            const n = op(r0, r1, r2)
            const m = getMonotonicity(flip(n, inc))
            expect(m.get('c0')).toEqual({ inc, dec: !inc })
            expect(m.get('c1')).toEqual({ inc, dec: !inc })
            expect(m.get('c2')).toEqual({ inc, dec: !inc })
          })
      })
    describe('non-zero prod', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n0 = prod(r0, r1, r2)
          const m0 = getMonotonicity(flip(n0, inc))
          expect(m0.get('c0')).toEqual({ inc, dec: !inc })
          expect(m0.get('c1')).toEqual({ inc, dec: !inc })
          expect(m0.get('c2')).toEqual({ inc, dec: !inc })

          const n1 = prod(sum(r0, -8), r1, r2)
          const m1 = getMonotonicity(flip(n1, inc))
          expect(m1.get('c0')).toEqual({ inc, dec: !inc })
          expect(m1.get('c1')).toEqual({ inc: !inc, dec: inc })
          expect(m1.get('c2')).toEqual({ inc: !inc, dec: inc })

          const n2 = prod(sum(r0, -8), sum(r1, -12), r2)
          const m2 = getMonotonicity(flip(n2, inc))
          expect(m2.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(m2.get('c1')).toEqual({ inc: !inc, dec: inc })
          expect(m2.get('c2')).toEqual({ inc, dec: !inc })

          const n3 = prod(sum(r0, -8), sum(r1, -12), sum(r2, -9))
          const m3 = getMonotonicity(flip(n3, inc))
          expect(m3.get('c0')).toEqual({ inc, dec: !inc })
          expect(m3.get('c1')).toEqual({ inc, dec: !inc })
          expect(m3.get('c2')).toEqual({ inc, dec: !inc })
        })
    })
    describe('maybe-zero prod', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n1 = prod(sum(r0, -7), r1, r2)
          const m1 = getMonotonicity(flip(n1, inc))
          expect(m1.get('c0')?.[inc ? 'dec' : 'inc']).toEqual(false)
          expect(m1.get('c1')?.[inc ? 'inc' : 'dec']).toEqual(false)
          expect(m1.get('c2')?.[inc ? 'inc' : 'dec']).toEqual(false)

          const n2 = prod(sum(r0, -7), sum(r1, -11), r2)
          const m2 = getMonotonicity(flip(n2, inc))
          expect(m2.get('c0')?.[inc ? 'inc' : 'dec']).toEqual(false)
          expect(m2.get('c1')?.[inc ? 'inc' : 'dec']).toEqual(false)
          expect(m2.get('c2')?.[inc ? 'dec' : 'inc']).toEqual(false)

          const n3 = prod(sum(r0, -4), r1, r2) // r0 can be neg/zero/pos
          const m3 = getMonotonicity(flip(n3, inc))
          expect(m3.get('c0')?.[inc ? 'dec' : 'inc']).toEqual(false)
          expect(m3.get('c1')).toEqual({ inc: false, dec: false })
          expect(m3.get('c2')).toEqual({ inc: false, dec: false })

          const n4 = prod(r0, r1, r2) // pos * pos * pos
          const m4 = getMonotonicity(flip(n4, inc))
          expect(m4.get('c0')).toEqual({ inc, dec: !inc })
          expect(m4.get('c1')).toEqual({ inc, dec: !inc })
          expect(m4.get('c2')).toEqual({ inc, dec: !inc })

          const n5 = prod(sum(r0, -7), r1, r2) // neg * pos * pos
          const m5 = getMonotonicity(flip(n5, inc))
          expect(m5.get('c0')).toEqual({ inc, dec: !inc })
          expect(m5.get('c1')).toEqual({ inc: !inc, dec: inc })
          expect(m5.get('c2')).toEqual({ inc: !inc, dec: inc })

          const n6 = prod(sum(r0, -7), sum(r1, -11), r2) // neg * neg * pos
          const m6 = getMonotonicity(flip(n6, inc))
          expect(m6.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(m6.get('c1')).toEqual({ inc: !inc, dec: inc })
          expect(m6.get('c2')).toEqual({ inc, dec: !inc })

          const n7 = prod(sum(r0, -7), sum(r1, -11), sum(r2, -9)) // neg * neg * neg
          const m7 = getMonotonicity(flip(n7, inc))
          expect(m7.get('c0')).toEqual({ inc, dec: !inc })
          expect(m7.get('c1')).toEqual({ inc, dec: !inc })
          expect(m7.get('c2')).toEqual({ inc, dec: !inc })
        })
    })
    // r0 < r2 < r1
    describe('match', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n = cmpEq(r0, 3, r1, r2)
          const m = getMonotonicity(flip(n, inc))
          expect(m.get('c0')).toEqual({ inc: false, dec: false })
          expect(m.get('c1')).toEqual({ inc, dec: !inc })
          expect(m.get('c2')).toEqual({ inc, dec: !inc })
        })
    })
    describe('thres', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n1 = cmpGE(r0, 3, r1, r2)
          const m1 = getMonotonicity(flip(n1, inc))
          expect(m1.get('c0')).toEqual({ inc, dec: !inc })
          expect(m1.get('c1')).toEqual({ inc, dec: !inc })
          expect(m1.get('c2')).toEqual({ inc, dec: !inc })

          const n2 = cmpGE(r0, 3, r2, r1)
          const m2 = getMonotonicity(flip(n2, inc))
          expect(m2.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(m2.get('c1')).toEqual({ inc, dec: !inc })
          expect(m2.get('c2')).toEqual({ inc, dec: !inc })

          const n3 = cmpGE(3, r0, r1, r2)
          const m3 = getMonotonicity(flip(n3, inc))
          expect(m3.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(m3.get('c1')).toEqual({ inc, dec: !inc })
          expect(m3.get('c2')).toEqual({ inc, dec: !inc })

          const n4 = cmpGE(3, r0, r2, r1)
          const m4 = getMonotonicity(flip(n4, inc))
          expect(m4.get('c0')).toEqual({ inc, dec: !inc })
          expect(m4.get('c1')).toEqual({ inc, dec: !inc })
          expect(m4.get('c2')).toEqual({ inc, dec: !inc })
        })
    })
    describe('sumfrac', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const npos = sumfrac(r0, r1)
          const mpos = getMonotonicity(flip(npos, inc))
          expect(mpos.get('c0')).toEqual({ inc, dec: !inc })
          expect(mpos.get('c1')).toEqual({ inc: !inc, dec: inc })

          const negx = sumfrac(sum(r0, -8), r1)
          const mnegx = getMonotonicity(flip(negx, inc))
          expect(mnegx.get('c0')).toEqual({ inc, dec: !inc })
          expect(mnegx.get('c1')).toEqual({ inc, dec: !inc })

          const negc = sumfrac(r0, sum(r1, -12))
          const mnegc = getMonotonicity(flip(negc, inc))
          expect(mnegc.get('c0')).toEqual({ inc: !inc, dec: inc })
          expect(mnegc.get('c1')).toEqual({ inc: !inc, dec: inc })

          const degen = sumfrac(r0, prod(-1, r0))
          const mdegen = getMonotonicity(flip(degen, inc))
          expect(mdegen.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
    describe('lookup', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const table = { a: r1, b: r2, c: 6 }
          const n = lookup(subscript(r0, ['a', 'b', 'c']), table)
          const m = getMonotonicity(flip(n, inc))
          expect(m.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
    describe('subscript', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const n0 = subscript(r0, [33, 44, 1, 2, 3])
          const m0 = getMonotonicity(flip(n0, inc))
          expect(m0.get('c0')).toEqual({ inc, dec: !inc })

          const n1 = subscript(r0, [33, 44, 4, 3, 2])
          const m1 = getMonotonicity(flip(n1, inc))
          expect(m1.get('c0')).toEqual({ inc: !inc, dec: inc })

          const n2 = subscript(r0, [33, 44, 4, 3, 5])
          const m2 = getMonotonicity(flip(n2, inc))
          expect(m2.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
    describe('custom', () => {
      for (const inc of [true, false])
        test(inc ? 'inc' : 'dec', () => {
          const pos = custom('sqrt', r0)
          const mpos = getMonotonicity(flip(pos, inc))
          expect(mpos.get('c0')).toEqual({ inc, dec: !inc })

          const neg = custom('sqrt', sum(r0, -8))
          const mneg = getMonotonicity(flip(neg, inc))
          expect(mneg.get('c0')).toEqual({ inc: !inc, dec: inc })

          const zero = custom('sqrt', sum(r0, -4))
          const mzero = getMonotonicity(flip(zero, inc))
          expect(mzero.get('c0')).toEqual({ inc: false, dec: false })
        })
    })
  })
})
