import {
  cmpEq,
  cmpGE,
  cmpLT,
  max,
  min,
  prod,
  read,
  subscript,
  sum,
} from '../node'
import { State } from './prune'

describe('state', () => {
  const read0 = read({ q: 'c0' }, undefined)
  const read1 = read({ q: 'c1' }, undefined)
  const read2 = read({ q: 'c2' }, undefined)
  const nodes = [
    sum(read0, read1, 2),
    prod(read0, read1, 2),
    min(read0, read1, 2),
    max(read0, read1, 2),
    cmpEq(read2, 3, read0, read1),
    cmpGE(read2, 3, read0, read1),
    cmpLT(read2, 3, read1, read0),
    subscript(read0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  ]

  const builds = [
    [
      { c0: 0, c1: 10, c2: 0 },
      { c0: 5, c1: 6, c2: 0 },
    ],
    [
      { c0: 7, c1: 10, c2: 0 },
      { c0: 3, c1: 7, c2: 0 },
    ],
  ]
  const state = new State(nodes, builds, 'q')

  test('comp ranges', () => {
    const { compRanges } = state
    expect(compRanges.length).toEqual(builds.length)
    expect(compRanges[0]).toEqual({
      c0: { min: 0, max: 5 },
      c1: { min: 6, max: 10 },
      c2: { min: 0, max: 0 },
    })
    expect(compRanges[1]).toEqual({
      c0: { min: 3, max: 7 },
      c1: { min: 7, max: 10 },
      c2: { min: 0, max: 0 },
    })
  })
  test('node ranges', () => {
    const { nodeRanges } = state
    expect(nodeRanges.get(read0)).toEqual({ min: 3, max: 12 })
    expect(nodeRanges.get(read1)).toEqual({ min: 13, max: 20 })
    expect(nodeRanges.get(nodes[0])).toEqual({ min: 18, max: 34 }) // sum
    expect(nodeRanges.get(nodes[1])).toEqual({ min: 78, max: 480 }) // prod
    expect(nodeRanges.get(nodes[2])).toEqual({ min: 2, max: 2 }) // min
    expect(nodeRanges.get(nodes[3])).toEqual({ min: 13, max: 20 }) // max
    expect(nodeRanges.get(nodes[4])).toEqual({ min: 3, max: 20 }) // cmpEq
    expect(nodeRanges.get(nodes[5])).toEqual({ min: 3, max: 20 }) // maxGE
    expect(nodeRanges.get(nodes[6])).toEqual({ min: 3, max: 20 }) // maxLT
    expect(nodeRanges.get(nodes[7])).toEqual({ min: 0, max: 12 }) // subscript
  })
  test('monotonicity', () => {
    const { monotonicities } = state
    expect(monotonicities.size).toEqual(3)
    expect(monotonicities.get('c0')).toEqual({ inc: true, dec: false })
    expect(monotonicities.get('c1')).toEqual({ inc: true, dec: false })
    expect(monotonicities.get('c2')).toEqual({ inc: false, dec: false })
  })
})
