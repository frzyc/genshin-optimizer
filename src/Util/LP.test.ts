import { LPConstraint, maximizeLP, testExport, Weights } from "./LP"
import largeProblem from "./LP.test.data.json"

const { solveLPEq } = testExport

describe("LP", () => {
  describe("solveLPEq", () => {
    it("can solve welformed equations", () => {
      // x = 1, y = 2
      const sol = solveLPEq([[1, 1], [1, -1]], [3, -1])
      expect(sol).toEqual([1, 2])
    })
  })
  describe("maximizeLP", () => {
    it("can minimize simple constrained problem", () => {
      const { x, y } = maximizeLP({ x: 3, y: 2 }, [
        { weights: { x: 1, y: 2 }, upperBound: 3.5 },
        { weights: { x: 2, y: 1 }, upperBound: 3 },
        { weights: { x: 1, y: 1 }, upperBound: 2 },
      ])
      // max 5 at x = y = 1
      expect(3 * x + 2 * y).toBeCloseTo(5, 8)
      expect(x + 2 * y).toBeLessThan(3.5)
      expect(2 * x + y).toBeLessThan(3)
      expect(x + y).toBeLessThan(2)
    })
    it("can minimize problem with equality constraint", () => {
      const { x, y } = maximizeLP({ x: 2, y: 3 }, [
        { weights: { x: 1, y: 1 }, lowerBound: 1, upperBound: 1 },
        { weights: { x: 1 }, lowerBound: 0 },
        { weights: { y: 1 }, lowerBound: 0 }
      ])
      // max 3 at (x, y) = (0, 1)
      expect(2 * x + 3 * y).toBeCloseTo(3, 8)
      expect(x + y).toBeCloseTo(1, 8)
      expect(x).toBeGreaterThan(0)
      expect(y).toBeGreaterThan(0)
    })
    it("can detect degenerate case", () => {
      const { x, y } = maximizeLP({}, [
        { weights: { x: 1, y: 1 }, lowerBound: 5, upperBound: 5 },
        { weights: { x: 2, y: 1 }, lowerBound: 7, upperBound: 7 },
        { weights: { x: 1, y: 2 }, lowerBound: 8, upperBound: 8 },
        { weights: { x: 1, y: -1 }, lowerBound: -1, upperBound: -1 },
      ])
      // The only valid point is (2, 3)
      expect(x).toBeCloseTo(2, 8)
      expect(y).toBeCloseTo(3, 8)
    })
    it.skip("on large test problem", () => {
      const obj = largeProblem.obj as Weights, constraints = largeProblem.constraints as any as LPConstraint[]
      const sol = maximizeLP(obj, constraints)

      constraints.forEach((constraint, i) => {
        const sum = Object.entries(constraint.weights).reduce((accu, [k, val]) => accu + sol[k] * val, 0)
        const { lowerBound, upperBound } = constraint
        if (lowerBound) expect(sum).toBeGreaterThanOrEqual(lowerBound)
        if (upperBound) expect(sum).toBeLessThanOrEqual(upperBound)
      })
    })
  })
})
