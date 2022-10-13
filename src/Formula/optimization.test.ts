import { precompute, testing } from "./optimization"
import { ConstantNode, Data } from "./type"
import { constant, customRead, data, max, min, prod, read, resetData, setReadNodeKeys, sum } from "./utils"

const { constantFold, deduplicate, flatten } = testing

const inputs = setReadNodeKeys(Object.fromEntries([...Array(6).keys()].map(i => [i, read("add")])))

describe("optimization", () => {
  describe("flatten", () => {
    test("same formulas", () => {
      const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]
      const r4 = inputs[3], r5 = inputs[4], r6 = inputs[5]

      const f1 = sum(r1, r2, sum(r3, r4), r5, r6)
      expect(flatten([f1])).toEqual([sum(r1, r2, r3, r4, r5, r6)])
    })
    test("nested formulas", () => {
      const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]
      const r4 = inputs[3], r5 = inputs[4], r6 = inputs[5]

      const f = sum(r1, sum(r2, sum(r3, sum(r4, sum(r5, r6)))))
      expect(flatten([f])).toEqual([sum(r1, r2, r3, r4, r5, r6)])
    })
  })
  test("deduplicate common terms", () => {
    const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]
    const r4 = inputs[3], r5 = inputs[4], r6 = inputs[5]

    const f1 = sum(r1, r2, r3, r4, r5, r6), f2 = sum(r3, r4)
    // TODO: Factoring process may reorder the term ( r3 + r4 ). May need to update the checking
    expect(deduplicate([f1, f2])).toEqual([sum(r1, r2, r5, r6, sum(r3, r4)), sum(r3, r4)])
  })
  test("constant folding", () => {
    const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]

    expect(constantFold([sum(1, -1, r1, r2, r3)], {})).toEqual([sum(r1, r2, r3)])
    expect(constantFold([prod(1, r1, r2, r3)], {})).toEqual([prod(r1, r2, r3)])
    expect(constantFold([min(Infinity, r1, r2, r3)], {})).toEqual([min(r1, r2, r3)])
    expect(constantFold([max(-Infinity, r1, r2, r3)], {})).toEqual([max(r1, r2, r3)])

    // Degenerate case
    expect(constantFold([prod(0, r1, r2, r3)], {})).toEqual([constant(0)])

    // Remove wrapper for single-value formula
    expect(constantFold([sum(1, -1, r1)], {})).toEqual([r1])
  })
  test("data unpacking", () => {
    const r1 = customRead(["aa"])
    r1.accu = "add"
    const data0 = { aa: constant(66) } as any as Data
    const data1 = { aa: constant(77) } as any as Data
    const t1 = data(r1, data1)

    expect(constantFold([resetData(t1, {}), t1], data0).map(x => (x as ConstantNode<number>).value)).toEqual([77, 66 + 77])
  })
  describe("precomputing", () => {
    test("Base", () => {
      const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]
      const output1 = sum(1, r1, r2), output2 = prod(r2, r3), output3 = sum(output1, output2)

      const compute = precompute([output1], {}, x => x.path[0], 1)
      expect([...compute([{ id: "", values: { 0: 32, 1: 77 } }]).slice(0, 1)]).toEqual([1 + 32 + 77])
    })
    test("Output is read node", () => {
      const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]
      const output1 = sum(1, r1, r2), output2 = prod(r2, r3), output3 = sum(output1, output2)

      const compute = precompute([r1], {}, x => x.path[0], 1)
      expect([...compute([{ id: "", values: { 0: 32 } }]).slice(0, 1)]).toEqual([32])
    })
    test("Output is constant node", () => {
      const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]
      const output1 = sum(1, r1, r2), output2 = prod(r2, r3), output3 = sum(output1, output2)

      const compute = precompute([constant(35)], {}, x => x.path[0], 0)
      expect([...compute([]).slice(0, 1)]).toEqual([35])
    })
    test("Output is duplicated", () => {
      const r1 = inputs[0], r2 = inputs[1], r3 = inputs[2]
      const output1 = sum(1, r1, r2), output2 = prod(r2, r3), output3 = sum(output1, output2)

      const compute = precompute([output3, output3], {}, x => x.path[0], 1)
      expect([...compute([{ id: "", values: { 0: 2, 1: 44, 2: 7 } }]).slice(0, 2)]).toEqual([(1 + 2 + 44) + (44 * 7), (1 + 2 + 44) + (44 * 7)])
    })
  })
})
