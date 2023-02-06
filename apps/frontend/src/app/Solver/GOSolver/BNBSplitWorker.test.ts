import { allOperations } from "../../Formula/optimization"
import { constant, customRead, frac, max, min, prod, res, sum, threshold } from "../../Formula/utils"
import { Linear, linearUpperBound } from "./BNBSplitWorker"
import { ArtifactsBySlot, DynStat } from "../common"

function apply(value: DynStat, linear: Linear): number {
  return Object.entries(linear).reduce((accu, [k, v]) => accu + v * (value[k] ?? 0), linear.$c)
}

describe("linearUpperBound can transform", () => {
  // `x` ranges from 0 - 5
  const rx = customRead(["dyn", "x"]), arts: ArtifactsBySlot = {
    base: { x: 0 },
    values: {
      flower: [{ id: "-0", values: {} }, { id: "0", values: { x: 1 } }],
      circlet: [{ id: "-1", values: {} }, { id: "1", values: { x: 1 } }],
      sands: [{ id: "-2", values: {} }, { id: "2", values: { x: 1 } }],
      goblet: [{ id: "-3", values: {} }, { id: "3", values: { x: 1 } }],
      plume: [{ id: "-4", values: {} }, { id: "4", values: { x: 1 } }],
    }
  }

  test("constant nodes", () => {
    const bounds = linearUpperBound([constant(88)], arts)
    expect(bounds[0]).toEqual({ $c: 88 })
  })
  test("read nodes", () => {
    const bounds = linearUpperBound([rx], arts)
    expect(bounds[0]).toEqual({ x: 1, $c: 0 })
  })

  /**
   * Note that all checkings below should be `toBeGreaterThanOrEqual`. Some of them
   * are `toEqual` or `toBeCloseTo` because bounds at those points should be sharp on
   * all optimal bounds.
   */
  test("min/max nodes", () => {
    const bounds = linearUpperBound([min(rx, 3), max(rx, 3)], arts)

    // Checking min/c/max
    expect(apply({ x: 0 }, bounds[0])).toBeGreaterThanOrEqual(Math.min(0, 3))
    expect(apply({ x: 3 }, bounds[0])).toEqual(Math.min(3, 3))
    expect(apply({ x: 5 }, bounds[0])).toBeGreaterThanOrEqual(Math.min(5, 3))

    expect(apply({ x: 0 }, bounds[1])).toEqual(Math.max(0, 3))
    expect(apply({ x: 3 }, bounds[1])).toBeGreaterThanOrEqual(Math.max(3, 3))
    expect(apply({ x: 5 }, bounds[1])).toEqual(Math.max(5, 3))
  })
  test("res nodes", () => {
    const op = allOperations.res, bounds = linearUpperBound([
      res(rx), res(sum(rx, -4)), res(sum(rx, 20)), res(sum(rx, -20)),
    ], arts)
    // Checking min/max
    expect(apply({ x: 0 }, bounds[0])).toBeCloseTo(op([0]), 8)
    expect(apply({ x: 5 }, bounds[0])).toBeCloseTo(op([5]), 8)

    expect(apply({ x: 0 }, bounds[1])).toBeGreaterThanOrEqual(op([0 - 4]))
    expect(apply({ x: 4 }, bounds[1])).toEqual(op([0])) // Check inflection point
    expect(apply({ x: 5 }, bounds[1])).toBeGreaterThanOrEqual(op([5 - 4]))

    expect(apply({ x: 0 }, bounds[2])).toBeCloseTo(op([0 + 20]), 8)
    expect(apply({ x: 5 }, bounds[2])).toBeCloseTo(op([5 + 20]), 8)

    expect(apply({ x: 0 }, bounds[3])).toBeCloseTo(op([0 - 20]), 8)
    expect(apply({ x: 5 }, bounds[3])).toBeCloseTo(op([5 - 20]), 8)
  })
  test("sum_frac nodes", () => {
    const op = allOperations.sum_frac, c = 4, loc = Math.sqrt((0 + c) * (5 + c))
    const bounds = linearUpperBound([frac(rx, c)], arts)

    // Checking min/loc/max
    expect(apply({ x: 0 }, bounds[0])).toBeGreaterThan(op([0, c]))
    expect(apply({ x: loc }, bounds[0])).toEqual(op([loc, c]))
    expect(apply({ x: 5 }, bounds[0])).toBeGreaterThan(op([5, c]))
  })
  test("threshold nodes", () => {
    // All pass >= fail, pass <= fail and upper/lower bounds combinations
    const bounds = linearUpperBound([
      threshold(rx, 4, 5, 10),
      threshold(rx, 4, 10, 5),
      prod(-1, threshold(rx, 4, -5, -10)),
      prod(-1, threshold(rx, 4, -10, -5)),
    ], arts)

    // Checking min/thresh/max
    expect(apply({ x: 0 }, bounds[0])).toBeGreaterThanOrEqual(10)
    expect(apply({ x: 4 }, bounds[0])).toEqual(Math.max(5, 10))
    expect(apply({ x: 5 }, bounds[0])).toBeGreaterThanOrEqual(5)

    expect(apply({ x: 0 }, bounds[1])).toBeGreaterThanOrEqual(5)
    expect(apply({ x: 4 }, bounds[1])).toEqual(Math.max(5, 10))
    expect(apply({ x: 5 }, bounds[1])).toBeGreaterThanOrEqual(10)

    expect(apply({ x: 0 }, bounds[2])).toBeGreaterThanOrEqual(10)
    expect(apply({ x: 4 }, bounds[2])).toEqual(Math.max(5, 10))
    expect(apply({ x: 5 }, bounds[2])).toBeGreaterThanOrEqual(5)

    expect(apply({ x: 0 }, bounds[3])).toBeGreaterThanOrEqual(5)
    expect(apply({ x: 4 }, bounds[3])).toEqual(Math.max(5, 10))
    expect(apply({ x: 5 }, bounds[3])).toBeGreaterThanOrEqual(10)
  })
  test("mul nodes", () => {
    const ry = customRead(["dyn", "y"]), arts: ArtifactsBySlot = {
      base: { x: 0, y: 0 },
      values: {
        flower: [{ id: "-0", values: { y: 1 } }, { id: "0", values: { x: 1 } }],
        circlet: [{ id: "-1", values: { y: 1 } }, { id: "1", values: { x: 1 } }],
        sands: [{ id: "-2", values: { y: 1 } }, { id: "2", values: { x: 1 } }],
        goblet: [{ id: "-3", values: { y: 1 } }, { id: "3", values: { x: 1 } }],
        plume: [{ id: "-4", values: { y: 1 } }, { id: "4", values: { x: 1 } }],
      }
    }

    const bounds = linearUpperBound([prod(rx, ry)], arts)

    // x + y === 5
    for (let x = 0; x <= 5; x++) {
      const y = 5 - x
      expect(apply({ x, y }, bounds[0])).toBeGreaterThanOrEqual(x * y)
    }
  })
})
