/* eslint-disable @typescript-eslint/no-unused-vars */
import { forEachNodes } from './internal'
import type { OptNode } from './optimization'
import { optimize, precompute, testing } from './optimization'
import type { AnyNode, ConstantNode, Data, Info } from './type'
import {
  constant,
  customRead,
  data,
  dynRead,
  infoMut,
  max,
  min,
  prod,
  resetData,
  sum,
} from './utils'

const { constantFold } = testing
const deduplicate = testing.deduplicate
const toSortedForm = testing.toSortedForm
const flatten = testing.flatten

const inputs = [...Array(6).keys()].map((i) => dynRead(`${i}`))

describe('optimization', () => {
  describe('flatten', () => {
    test('same formulas', () => {
      const r1 = inputs[0],
        r2 = inputs[1],
        r3 = inputs[2]
      const r4 = inputs[3],
        r5 = inputs[4],
        r6 = inputs[5]

      const f1 = sum(r1, r2, sum(r3, r4), r5, r6)
      expect(flatten([f1])).toEqual([sum(r1, r2, r3, r4, r5, r6)])
    })
    test('nested formulas', () => {
      const r1 = inputs[0],
        r2 = inputs[1],
        r3 = inputs[2]
      const r4 = inputs[3],
        r5 = inputs[4],
        r6 = inputs[5]

      const f = sum(r1, sum(r2, sum(r3, sum(r4, sum(r5, r6)))))
      expect(flatten([f])).toEqual([sum(r1, r2, r3, r4, r5, r6)])
    })
  })
  test('deduplicate common terms', () => {
    const r1 = inputs[0],
      r2 = inputs[1],
      r3 = inputs[2]
    const r4 = inputs[3],
      r5 = inputs[4],
      r6 = inputs[5]

    const f1 = sum(r1, r2, r3, r4, r5, r6),
      f2 = sum(r3, r4)
    // TODO: Factoring process may reorder the term ( r3 + r4 ). May need to update the checking
    expect(deduplicate([f1, f2])).toEqual([
      sum(r1, r2, r5, r6, sum(r3, r4)),
      sum(r3, r4),
    ])
  })
  test('complex formula invariant', () => {
    // Raiden N3C1DD or something idk
    // prettier-ignore
    const f: OptNode = {"operation":"mul","operands":[{"operation":"const","operands":[],"type":"number","value":1.8612790000000001},{"operation":"mul","operands":[{"operation":"add","operands":[{"operation":"const","operands":[],"type":"number","value":0.27},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","NoblesseOblige"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.2},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","EmblemOfSeveredFate"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":4},{"operation":"min","operands":[{"operation":"const","operands":[],"type":"number","value":0.75},{"operation":"mul","operands":[{"operation":"const","operands":[],"type":"number","value":0.25},{"operation":"add","operands":[{"operation":"read","operands":[],"path":["dyn","0"],"accu":"add","type":"number"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","EmblemOfSeveredFate"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.2},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","TheExile"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.2},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"}]}]}]},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"add","operands":[{"operation":"read","operands":[],"path":["dyn","1"],"accu":"add","type":"number"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","ThunderingFury"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.15},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"mul","operands":[{"operation":"const","operands":[],"type":"number","value":0.4},{"operation":"add","operands":[{"operation":"const","operands":[],"type":"number","value":-1},{"operation":"add","operands":[{"operation":"read","operands":[],"path":["dyn","0"],"accu":"add","type":"number"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","EmblemOfSeveredFate"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.2},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","TheExile"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.2},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"}]}]}]}]}]},{"operation":"mul","operands":[{"operation":"const","operands":[],"type":"number","value":0.8214285714285714},{"operation":"add","operands":[{"operation":"const","operands":[],"type":"number","value":1},{"operation":"mul","operands":[{"operation":"read","operands":[],"path":["dyn","2"],"accu":"add","type":"number"},{"operation":"read","operands":[],"path":["dyn","3"],"accu":"add","type":"number"}]}]},{"operation":"add","operands":[{"operation":"read","operands":[],"path":["dyn","5"],"accu":"add","type":"number"},{"operation":"mul","operands":[{"operation":"const","operands":[],"type":"number","value":945.3161116309998},{"operation":"add","operands":[{"operation":"read","operands":[],"path":["dyn","4"],"accu":"add","type":"number"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","GladiatorsFinale"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.18},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","ShimenawasReminiscence"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.18},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"min","operands":[{"operation":"const","operands":[],"type":"number","value":0.8},{"operation":"mul","operands":[{"operation":"const","operands":[],"type":"number","value":0.28},{"operation":"add","operands":[{"operation":"const","operands":[],"type":"number","value":-1},{"operation":"add","operands":[{"operation":"read","operands":[],"path":["dyn","0"],"accu":"add","type":"number"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","EmblemOfSeveredFate"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.2},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"},{"operation":"threshold","operands":[{"operation":"read","operands":[],"path":["dyn","TheExile"],"accu":"add","type":"number"},{"operation":"const","operands":[],"type":"number","value":2},{"operation":"const","operands":[],"type":"number","value":0.2},{"operation":"const","operands":[],"type":"number","value":0}],"emptyOn":"l"}]}]}]}]}]}]}]}]}]}]}

    const cf = (ns: OptNode[]) => constantFold(ns, {})
    const seq1 = [cf, flatten, cf, toSortedForm]
    const seq2 = [toSortedForm, cf, flatten, toSortedForm, cf]

    let nodes = optimize([f], {})
    for (let j = 0; j < seq2.length; j++) {
      const nxt = seq2[j](nodes)
      expect(nxt).toEqual(nodes)
      nodes = nxt
    }
  })
  test('normal form & deduplicate identical terms', () => {
    const r0 = inputs[0],
      r1 = inputs[1],
      r2 = inputs[2],
      r3 = inputs[3]
    const v0 = dynRead('0'),
      v1 = dynRead('1'),
      v2 = dynRead('2'),
      v3 = dynRead('3')
    const f1 = prod(sum(prod(r1, r0), 1), r2, r3)
    const f2 = prod(v3, v2, sum(prod(v1, v0), 1))

    const dedup = toSortedForm([sum(f1, f2)])[0]
    expect(dedup.operands[0] === dedup.operands[1])
    expect(dedup).toEqual(
      sum(
        prod(r2, r3, sum(1, prod(r0, r1))),
        prod(r2, r3, sum(1, prod(r0, r1)))
      )
    )
  })
  test('constant folding', () => {
    const r1 = inputs[0],
      r2 = inputs[1],
      r3 = inputs[2]

    expect(constantFold([sum(1, -1, r1, r2, r3)], {})).toEqual([
      sum(r1, r2, r3),
    ])
    expect(constantFold([prod(1, r1, r2, r3)], {})).toEqual([prod(r1, r2, r3)])
    expect(constantFold([min(Infinity, r1, r2, r3)], {})).toEqual([
      min(r1, r2, r3),
    ])
    expect(constantFold([max(-Infinity, r1, r2, r3)], {})).toEqual([
      max(r1, r2, r3),
    ])

    // Degenerate case
    expect(constantFold([prod(0, r1, r2, r3)], {})).toEqual([constant(0)])

    // Remove wrapper for single-value formula
    expect(constantFold([sum(1, -1, r1)], {})).toEqual([r1])

    {
      // Removing Info
      const node = sum(1, -1, infoMut(sum(r1), {} as any), r2, r3)
      let info: Info | undefined = undefined
      forEachNodes<AnyNode>(
        [node],
        (_) => _,
        (f) => (info ||= f.info)
      )
      expect(info).toBeTruthy()

      info = undefined
      forEachNodes(
        constantFold([node], {}),
        (_) => _,
        (f) => (info ||= f.info)
      )
      expect(info).toBeFalsy()
    }
  })
  test('data unpacking', () => {
    const r1 = customRead(['aa'])
    r1.accu = 'add'
    const data0 = { aa: constant(66) } as any as Data
    const data1 = { aa: constant(77) } as any as Data
    const t1 = data(r1, data1)

    expect(
      constantFold([resetData(t1, {}), t1], data0).map(
        (x) => (x as ConstantNode<number>).value
      )
    ).toEqual([77, 66 + 77])
  })
  describe('precomputing', () => {
    test('Base', () => {
      const r1 = inputs[0],
        r2 = inputs[1],
        r3 = inputs[2]
      const output1 = sum(1, r1, r2),
        output2 = prod(r2, r3),
        output3 = sum(output1, output2)

      const compute = precompute(
        [output1] as OptNode[],
        {},
        (x) => x.path[1],
        1
      )
      expect([
        ...compute([{ id: '', values: { 0: 32, 1: 77 } }]).slice(0, 1),
      ]).toEqual([1 + 32 + 77])
    })
    test('Output is read node', () => {
      const r1 = inputs[0],
        r2 = inputs[1],
        r3 = inputs[2]
      const output1 = sum(1, r1, r2),
        output2 = prod(r2, r3),
        output3 = sum(output1, output2)

      const compute = precompute([r1], {}, (x) => x.path[1], 1)
      expect([...compute([{ id: '', values: { 0: 32 } }]).slice(0, 1)]).toEqual(
        [32]
      )
    })
    test('Output is constant node', () => {
      const r1 = inputs[0],
        r2 = inputs[1],
        r3 = inputs[2]
      const output1 = sum(1, r1, r2),
        output2 = prod(r2, r3),
        output3 = sum(output1, output2)

      const compute = precompute([constant(35)], {}, (x) => x.path[1], 0)
      expect([...compute([]).slice(0, 1)]).toEqual([35])
    })
    test('Output is duplicated', () => {
      const r1 = inputs[0],
        r2 = inputs[1],
        r3 = inputs[2]
      const output1 = sum(1, r1, r2),
        output2 = prod(r2, r3),
        output3 = sum(output1, output2)

      const compute = precompute(
        [output3, output3] as OptNode[],
        {},
        (x) => x.path[1],
        1
      )
      expect([
        ...compute([{ id: '', values: { 0: 2, 1: 44, 2: 7 } }]).slice(0, 2),
      ]).toEqual([1 + 2 + 44 + 44 * 7, 1 + 2 + 44 + 44 * 7])
    })
  })
})
