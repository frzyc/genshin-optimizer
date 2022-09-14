import { maximizeLP } from "./LP"

describe("LP", () => {
  describe("maximizeLP", () => {
    it("can minimize simple constrained problem", () => {
      const { x, y } = maximizeLP({ x: 3, y: 2 }, [
        { weights: { x: 1, y: 2 }, upperBound: 3.5 },
        { weights: { x: 2, y: 1 }, upperBound: 3 },
        { weights: { x: 1, y: 1 }, upperBound: 2 },
      ])
      // max 5 at x = y = 1
      expect(3 * x + 2 * y).toBeCloseTo(5, 8)
      expect(x + 2 * y).toBeLessThanOrEqual(3.5)
      expect(2 * x + y).toBeLessThanOrEqual(3)
      expect(x + y).toBeLessThanOrEqual(2)
    })
    it("can minimize problem with equality constraint", () => {
      const { x, y } = maximizeLP({ x: 2, y: 3 }, [
        { weights: { x: 1, y: 1 }, lowerBound: 1, upperBound: 1 },
      ])
      // max 3 at (x, y) = (0, 1)
      expect(2 * x + 3 * y).toBeCloseTo(3, 8)
      expect(x + y).toBeCloseTo(1, 8)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
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
  })
})
