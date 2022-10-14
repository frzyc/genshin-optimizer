import { maximizeLP } from "./LP"

describe("LP", () => {
  describe("maximizeLP", () => {
    it("can minimize simple constrained problem", () => {
      const [x, y] = maximizeLP([3, 2], [
        [3.5, 1, 2], // x + 2y <= 3.5
        [3, 2, 1],   // 2x + y <= 3
        [2, 1, 1],   // x + y  <= 2
      ])
      // max 5 at x = y = 1
      expect(3 * x + 2 * y).toBeCloseTo(5, 8)
      expect(x + 2 * y).toBeLessThanOrEqual(3.5)
      expect(2 * x + y).toBeLessThanOrEqual(3)
      expect(x + y).toBeLessThanOrEqual(2)
    })
    it("can minimize problem with equality constraint", () => {
      const [x, y] = maximizeLP([2, 3], [
        [1, 1, 1],    // x + y <= 1
        [-1, -1, -1], // x + y >= 1
      ])
      // max 3 at (x, y) = (0, 1)
      expect(2 * x + 3 * y).toBeCloseTo(3, 8)
      expect(x + y).toBeCloseTo(1, 8)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
    })
  })
})
