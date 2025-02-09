import {
  cmpEq,
  cmpGE,
  custom,
  max,
  min,
  prod,
  read,
  subscript,
  sum,
  sumfrac,
} from '../node'
import { addCustomOperation } from '../util'
import { State } from './prune'

addCustomOperation('sq', {
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

describe('state', () => {
  const r0 = read({ q: 'c0' }, undefined)
  const r1 = read({ q: 'c1' }, undefined)
  const r2 = read({ q: 'c2' }, undefined)
  const nodes = [
    sum(r0, r1, r2),
    prod(r0, r1, r2),
    min(r0, r1, r2),
    max(r0, r1, r2),
    cmpEq(r2, 3, r0, r1),
    cmpGE(r2, 3, r0, r1),
    sumfrac(r0, r1),
    subscript(r0, [44, 2, 3, 4, 5, 22, 7, 8]),
    // lookup
    custom('sq', sum(r0, -3)),
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
    expect(nodeRanges.get(nodes[8])).toEqual({ min: 0, max: 16 }) // (r0 - 3)^2
  })
  describe('monotonicity', () => {
    // False negative is fine (inc/dec is `false` when it should be `true`).
    // False positive is not (inc/dec is `true` when it should be `false`).
    // So make sure to check all cases that should return `false`, but we
    // can skip some `true` cases that aren't handled yet

    // `sumfrac` is better to "flip" the monotonicities than `prod`
    // since it has fewer restrictions
    for (const op of [sum, min, max]) {
      test(op.toString(), () => {
        const pos = op(r0, prod(-1, r1), r2, prod(-0.5, r2))
        const { monotonicities: mpos } = new State([pos], builds, 'q')
        expect(mpos.get('c0')).toEqual({ inc: true, dec: false })
        expect(mpos.get('c1')).toEqual({ inc: false, dec: true })
        expect(mpos.get('c2')).toEqual({ inc: false, dec: false })

        const neg = sumfrac(10000, op(r0, prod(-1, r1), r2, prod(-0.5, r2)))
        const { monotonicities: mneg } = new State([neg], builds, 'q')
        expect(mneg.get('c0')).toEqual({ inc: false, dec: true })
        expect(mneg.get('c1')).toEqual({ inc: true, dec: false })
        expect(mneg.get('c2')).toEqual({ inc: false, dec: false })
      })
    }
    test('prod', () => {
      const pos = prod(sum(r0, -8), r1, r2)
      const { monotonicities: mpos } = new State([pos], builds, 'q')
      expect(mpos.get('c0')).toEqual({ inc: true, dec: false })
      expect(mpos.get('c1')).toEqual({ inc: false, dec: true })
      expect(mpos.get('c2')).toEqual({ inc: false, dec: true })

      const neg = prod(-1, sum(r0, -8), r1, r2)
      const { monotonicities: mneg } = new State([neg], builds, 'q')
      expect(mneg.get('c0')).toEqual({ inc: false, dec: true })
      expect(mneg.get('c1')).toEqual({ inc: true, dec: false })
      expect(mneg.get('c2')).toEqual({ inc: true, dec: false })
    })
    test('degen prod', () => {
      const pos = prod(sum(r0, -2), r1, r2) // r0 - 2 is positive *or* zero
      const { monotonicities: mpos } = new State([pos], builds, 'q')
      expect(mpos.get('c0')!.dec).toBe(false)
      expect(mpos.get('c1')!.dec).toBe(false)
      expect(mpos.get('c2')!.dec).toBe(false)

      const neg = prod(sum(r0, -7), r1, r2) // r0 - 7 is negative *or* zero
      const { monotonicities: mneg } = new State([neg], builds, 'q')
      expect(mneg.get('c0')!.dec).toBe(false)
      expect(mneg.get('c1')!.inc).toBe(false)
      expect(mneg.get('c2')!.inc).toBe(false)
    })
    test('match', () => {
      const n1 = cmpEq(r0, 3, r1, r2)
      const { monotonicities: m1 } = new State([n1], builds, 'q')
      expect(m1.get('c0')).toEqual({ inc: false, dec: false })
      expect(m1.get('c1')).toEqual({ inc: true, dec: false })
      expect(m1.get('c2')).toEqual({ inc: true, dec: false })

      const n2 = sumfrac(10000, cmpEq(r0, 3, r1, r2))
      const { monotonicities: m2 } = new State([n2], builds, 'q')
      expect(m2.get('c0')).toEqual({ inc: false, dec: false })
      expect(m2.get('c1')).toEqual({ inc: false, dec: true })
      expect(m2.get('c2')).toEqual({ inc: false, dec: true })
    })
    test('thres', () => {
      const n1 = cmpGE(r0, 3, r1, r2)
      const { monotonicities: m1 } = new State([n1], builds, 'q')
      expect(m1.get('c0')).toEqual({ inc: true, dec: false })
      expect(m1.get('c1')).toEqual({ inc: true, dec: false })
      expect(m1.get('c2')).toEqual({ inc: true, dec: false })

      const n2 = cmpGE(r0, 3, r2, r1)
      const { monotonicities: m2 } = new State([n2], builds, 'q')
      expect(m2.get('c0')).toEqual({ inc: false, dec: true })
      expect(m2.get('c1')).toEqual({ inc: true, dec: false })
      expect(m2.get('c2')).toEqual({ inc: true, dec: false })
    })
    test('sumfrac', () => {
      const pos = sumfrac(r0, r1)
      const { monotonicities: mpos } = new State([pos], builds, 'q')
      expect(mpos.get('c0')).toEqual({ inc: true, dec: false })
      expect(mpos.get('c1')).toEqual({ inc: false, dec: true })

      const negx = sumfrac(sum(r0, -8), r1)
      const { monotonicities: mnegx } = new State([negx], builds, 'q')
      expect(mnegx.get('c0')).toEqual({ inc: true, dec: false })
      expect(mnegx.get('c1')).toEqual({ inc: true, dec: false })

      const negc = sumfrac(r0, sum(r1, -12))
      const { monotonicities: mnegc } = new State([negc], builds, 'q')
      expect(mnegc.get('c0')).toEqual({ inc: false, dec: true })
      expect(mnegc.get('c1')).toEqual({ inc: false, dec: true })

      const degen = sumfrac(r0, prod(-1, r0))
      const { monotonicities: mdegen } = new State([degen], builds, 'q')
      expect(mdegen.get('c0')).toEqual({ inc: false, dec: false })
    })
    test('subscript', () => {})
    // lookup
    test('custom', () => {
      const pos = custom('sq', r0)
      const { monotonicities: mpos } = new State([pos], builds, 'q')
      expect(mpos.get('c0')).toEqual({ inc: true, dec: false })

      const neg = custom('sq', sum(r0, -8))
      const { monotonicities: mneg } = new State([neg], builds, 'q')
      expect(mneg.get('c0')).toEqual({ inc: false, dec: true })

      const zero = custom('sq', sum(r0, -4))
      const { monotonicities: mzero } = new State([zero], builds, 'q')
      expect(mzero.get('c0')).toEqual({ inc: false, dec: false })
    })
  })
})
