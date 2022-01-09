import { constant } from "./internal"
import { constantFold, deduplicate, flatten } from "./optimization"
import { max, min, prod, read, setReadNodeKeys, sum } from "./utils"

const inputs = setReadNodeKeys(Object.fromEntries([...Array(6).keys()].map(i => [i, read("unique")])))

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

    expect(constantFold([sum(1, -1, r1, r2, r3)])).toEqual([sum(r1, r2, r3)])
    expect(constantFold([prod(1, r1, r2, r3)])).toEqual([prod(r1, r2, r3)])
    expect(constantFold([min(Infinity, r1, r2, r3)])).toEqual([min(r1, r2, r3)])
    expect(constantFold([max(-Infinity, r1, r2, r3)])).toEqual([max(r1, r2, r3)])

    // Degenerate case
    expect(constantFold([prod(0, r1, r2, r3)])).toEqual([constant(0)])

    // Remove wrapper for single-value formula
    expect(constantFold([sum(1, -1, r1)])).toEqual([r1])
  })
})
