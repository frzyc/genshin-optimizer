import cyclingProblem from './fixtures/odette-cycling-lp.js'
import { isFeasible, LPCycleError, solveLP } from './solveLP.js'

describe('solveLP', () => {
  test('solves a bounded linear program', () => {
    const constraints = [
      [1, 1, 4],
      [1, 0, 2],
      [0, 1, 3],
    ]
    const solution = solveLP([-1, -1], constraints)
    expect(isFeasible(constraints, solution)).toBe(true)
    expect(solution[0] + solution[1]).toBeCloseTo(4)
  })

  test('detects the degenerate cycle from issue #3324', () => {
    // Reduced from the LP generated while optimizing the attached Odette DB.
    // The original solver repeats three pivots and grows its history forever.
    expect(() => solveLP(cyclingProblem.c, cyclingProblem.Ab)).toThrow(
      LPCycleError
    )
  })

  test('continues to reject unbounded problems', () => {
    expect(() => solveLP([-1], [[-1, 0]])).toThrow('UNBOUNDED FEASIBLE')
  })
})
