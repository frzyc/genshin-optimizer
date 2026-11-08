import { cartesian } from '@genshin-optimizer/common/util'
import type { MinMax } from '../../common.js'
import { isFeasible, solveLP } from './solveLP.js'
import { solveLPBland } from './solveLPBland.js'

/**
 * Reference solver: enumerate every vertex of { Ax <= b, x >= 0 } by picking `n` tight
 * constraints at a time, and return the smallest objective among the feasible ones.
 * Exponential, so only usable for the tiny LPs below, but exact.
 */
function bruteForceMin(c: number[], Ab: number[][]): number {
  const n = c.length
  const rows = [...Ab]
  for (let j = 0; j < n; j++) {
    const row = Array(n + 1).fill(0)
    row[j] = -1 // -x_j <= 0
    rows.push(row)
  }
  const combos = (arr: number[], k: number): number[][] =>
    k === 0
      ? [[]]
      : arr.flatMap((v, i) =>
          combos(arr.slice(i + 1), k - 1).map((r) => [v, ...r])
        )

  let best = Number.POSITIVE_INFINITY
  for (const tight of combos([...rows.keys()], n)) {
    // Gauss-Jordan on the n x n system of tight constraints
    const A = tight.map((i) => [...rows[i]])
    let solvable = true
    for (let col = 0; col < n; col++) {
      let piv = -1
      for (let r = col; r < n; r++)
        if (Math.abs(A[r][col]) > 1e-9) {
          piv = r
          break
        }
      if (piv < 0) {
        solvable = false
        break
      }
      ;[A[col], A[piv]] = [A[piv], A[col]]
      for (let r = 0; r < n; r++) {
        if (r === col) continue
        const f = A[r][col] / A[col][col]
        for (let k = col; k <= n; k++) A[r][k] -= f * A[col][k]
      }
    }
    if (!solvable) continue
    const x = A.map((row, i) => row[n] / row[i])
    if (!isFeasible(rows, x)) continue
    const obj = objective(c, x)
    if (obj < best) best = obj
  }
  return best
}
function objective(c: number[], x: number[]): number {
  return x.reduce((tot, xi, i) => tot + xi * c[i], 0)
}

// `solveLP` minimizes c^T x subject to Ax <= b, x >= 0
const cases: {
  name: string
  c: number[]
  Ab: number[][]
  x?: number[]
  obj: number
}[] = [
  {
    // Ferguson p3: maximize x1 + x2 === minimize -x1 - x2
    name: 'a simple bounded LP',
    c: [-1, -1],
    Ab: [
      [1, 2, 4],
      [4, 2, 12],
      [-1, 1, 1],
    ],
    x: [8 / 3, 2 / 3],
    obj: -10 / 3,
  },
  {
    // Ferguson p33: the textbook example that cycles under careless pivot choices
    name: "Ferguson's cycling example",
    c: [-3, 5, -1, 2],
    Ab: [
      [1, -2, -1, 2, 0],
      [2, -3, -1, 1, 0],
      [0, 0, 1, 0, 1],
    ],
    x: [0.5, 0, 1, 0],
    obj: -2.5,
  },
  {
    // b has a negative entry, so this needs phase 1 (`findPiv2`) pivots to get feasible
    name: 'an LP requiring phase 1 pivots',
    c: [1, 1],
    Ab: [
      [-1, -1, -3],
      [1, 0, 5],
      [0, 1, 5],
    ],
    obj: 3, // multiple optima along x1 + x2 === 3
  },
  {
    // Four constraints meeting at (1, 1): the optimal vertex is degenerate
    name: 'an LP with a degenerate optimal vertex',
    c: [-1, -1],
    Ab: [
      [1, 1, 2],
      [1, 0, 1],
      [0, 1, 1],
      [2, 1, 3],
    ],
    x: [1, 1],
    obj: -2,
  },
  {
    // x1 + x2 <= 4 and -x1 - x2 <= -4 pin the sum exactly, another degenerate case
    name: 'an LP with opposing tight constraints',
    c: [-2, -3],
    Ab: [
      [1, 1, 4],
      [-1, -1, -4],
      [1, 0, 3],
    ],
    x: [0, 4],
    obj: -12,
  },
]

describe('solveLP', () => {
  test.each(cases)('solves $name', ({ c, Ab, x, obj }) => {
    const xOpt = solveLP(c, Ab)
    expect(isFeasible(Ab, xOpt)).toBe(true)
    expect(objective(c, xOpt)).toBeCloseTo(obj, 8)
    expect(objective(c, xOpt)).toBeCloseTo(bruteForceMin(c, Ab), 8)
    if (x) x.forEach((xi, i) => expect(xOpt[i]).toBeCloseTo(xi, 8))
  })

  test('detects infeasible problems', () => {
    // x1 <= -1 with x >= 0
    expect(() => solveLP([1, 1], [[1, 0, -1]])).toThrow(/INFEASIBLE/)
  })
  test('detects unbounded problems', () => {
    // minimize -x1 with x1 unbounded above
    expect(() => solveLP([-1, 0], [[-1, 0, 0]])).toThrow(/UNBOUNDED/)
  })

  test('matches brute force on random small LPs', () => {
    let seed = 20240607 // Fixed seed; these tests must be deterministic
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const randInt = (lo: number, hi: number) =>
      lo + Math.floor(rand() * (hi - lo + 1))

    let solved = 0
    for (let trial = 0; trial < 200; trial++) {
      const nVar = randInt(2, 3),
        nCons = randInt(3, 5)
      const c = Array.from({ length: nVar }, () => randInt(-10, 10))
      const Ab = Array.from({ length: nCons }, () => [
        ...Array.from({ length: nVar }, () => randInt(-10, 10)),
        randInt(0, 10),
      ])

      let xOpt: number[]
      try {
        xOpt = solveLP(c, Ab)
      } catch (e) {
        // Random LPs are legitimately infeasible/unbounded ~1 time in 6
        expect((e as Error).message).toMatch(/INFEASIBLE|UNBOUNDED/)
        continue
      }
      solved++
      expect(isFeasible(Ab, xOpt)).toBe(true)
      expect(objective(c, xOpt)).toBeCloseTo(bruteForceMin(c, Ab), 6)
    }
    expect(solved).toBe(165)
  })
})

/**
 * Rebuilds the LP that `linbound` (linearUB.ts) solves to bound a monomial on a box.
 * Kept in the same operation order as `linbound` because the pivot path — and the cycling
 * bug below — depends on the exact floating point values this produces.
 */
function monomialLP(bounds: MinMax[], direction: 'upper' | 'lower') {
  const nVar = bounds.length
  const boundScale = bounds.map(({ min, max }) => Math.max(-min, max))
  const scaled = bounds.map(({ min, max }, i) => ({
    min: min / boundScale[i],
    max: max / boundScale[i],
  }))
  const cons = cartesian(...scaled.map(({ min, max }) => [min, max])).flatMap(
    (coords) => {
      const prod = coords.reduce((prod, v) => prod * v, 1)
      const sum = coords.reduce((sum, v) => sum + v, 0)
      return direction === 'upper'
        ? [
            [...coords, -1, 0, sum - prod - nVar],
            [...coords.map((v) => -v), 1, -1, nVar + prod - sum],
          ]
        : [
            [...coords.map((v) => -v), -1, 0, prod - sum - nVar],
            [...coords, 1, -1, nVar + sum - prod],
          ]
    }
  )
  return { cons, objective: [...bounds.map((_) => 0), 0, 1], nVar }
}

// The bounds that made `linbound(bounds, 'upper')` spin forever. `max: 0.6214999999999999`
// is load-bearing: 0.6215 is a different double and does not trigger the cycle.
const reported: MinMax[] = [
  { min: 1.932, max: 2.4917 },
  { min: 2.016924, max: 2.685224 },
  { min: -689, max: -537.27 },
  { min: 0.4582, max: 0.6214999999999999 },
  { min: 0, max: 3 },
]

const shapes: { name: string; bounds: MinMax[]; err: number }[] = [
  { name: 'a single variable', bounds: [{ min: 2, max: 5 }], err: 0 },
  {
    name: 'a positive box',
    bounds: [
      { min: 1, max: 2 },
      { min: 3, max: 4 },
    ],
    err: 0.0625,
  },
  {
    name: 'a zero-width bound',
    bounds: [
      { min: 2, max: 2 },
      { min: 0, max: 3 },
    ],
    err: 0,
  },
  {
    name: 'a box straddling zero',
    bounds: [
      { min: -1, max: 2 },
      { min: -3, max: 1 },
    ],
    err: 1,
  },
  {
    name: 'an all-negative box',
    bounds: [
      { min: -5, max: -2 },
      { min: -4, max: -1 },
    ],
    err: 0.225,
  },
  {
    name: 'five mixed-sign variables',
    bounds: [
      { min: 0, max: 1 },
      { min: 0, max: 2 },
      { min: -1, max: 1 },
      { min: 1, max: 1.5 },
      { min: 0, max: 10 },
    ],
    err: 1,
  },
]

describe('monomial bound LPs', () => {
  test.each([
    'upper',
    'lower',
  ] as const)('terminates on the reported %s bound', (direction) => {
    const { cons, objective, nVar } = monomialLP(reported, direction)
    const soln = solveLP(objective, cons)
    // Feasibility here *is* the statement that the resulting linear bound is valid on
    // every corner of the box; the objective only measures how tight it is.
    expect(isFeasible(cons, soln)).toBe(true)
    expect(soln[nVar + 1]).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(soln[nVar + 1])).toBe(true)
  })

  test.each([
    'upper',
    'lower',
  ] as const)('finds the optimal %s bound for the reported case', (direction) => {
    const { cons, objective, nVar } = monomialLP(reported, direction)
    // Optimum cross-checked with Dantzig's rule and Bland's rule, both directions.
    // Loosen to `toBeLessThanOrEqual` if the solver ever settles for a feasible
    // but suboptimal vertex — the bound is still correct, just less tight.
    expect(solveLP(objective, cons)[nVar + 1]).toBeCloseTo(0.332591421396, 8)
  })

  describe.each(shapes)('$name', ({ bounds, err }) => {
    test.each(['upper', 'lower'] as const)('%s bound', (direction) => {
      const { cons, objective, nVar } = monomialLP(bounds, direction)
      const soln = solveLP(objective, cons)
      expect(isFeasible(cons, soln)).toBe(true)
      expect(soln[nVar + 1]).toBeCloseTo(err, 8)
    })
  })
})

describe('isFeasible', () => {
  const Ab = [
    [1, 1, 2],
    [-1, 0, 0],
  ]
  test('accepts points satisfying every constraint', () => {
    expect(isFeasible(Ab, [1, 1])).toBe(true)
    expect(isFeasible(Ab, [0, 0])).toBe(true)
  })
  test('rejects points violating a constraint', () => {
    expect(isFeasible(Ab, [2, 1])).toBe(false)
    expect(isFeasible(Ab, [-1, 0])).toBe(false)
  })
  test('tolerates violations within `zero`', () => {
    expect(isFeasible(Ab, [1, 1 + 1e-9])).toBe(true)
    expect(isFeasible(Ab, [1, 1 + 1e-6])).toBe(false)
  })
})

describe('solveLPBland', () => {
  // Multiple optima are common in these fixtures, and Bland's rule may land on a different
  //   vertex than `solveLP` does, so only the objective value is asserted.
  test.each(cases)('solves $name', ({ c, Ab, obj }) => {
    const xOpt = solveLPBland(c, Ab)
    expect(isFeasible(Ab, xOpt)).toBe(true)
    expect(objective(c, xOpt)).toBeCloseTo(obj, 8)
    expect(objective(c, xOpt)).toBeCloseTo(bruteForceMin(c, Ab), 8)
  })

  test('detects infeasible problems', () => {
    expect(() => solveLPBland([1, 1], [[1, 0, -1]])).toThrow(/INFEASIBLE/)
  })
  test('detects unbounded problems', () => {
    expect(() => solveLPBland([-1, 0], [[-1, 0, 0]])).toThrow(/UNBOUNDED/)
  })

  // The case `solveLP` cycles on; this is the solver it hands off to
  test.each([
    'upper',
    'lower',
  ] as const)('solves the reported %s bound outright', (direction) => {
    const { cons, objective, nVar } = monomialLP(reported, direction)
    const soln = solveLPBland(objective, cons)
    expect(isFeasible(cons, soln)).toBe(true)
    expect(soln[nVar + 1]).toBeCloseTo(0.332591421396, 8)
  })

  describe.each(shapes)('$name', ({ bounds, err }) => {
    test.each(['upper', 'lower'] as const)('%s bound', (direction) => {
      const { cons, objective, nVar } = monomialLP(bounds, direction)
      const soln = solveLPBland(objective, cons)
      expect(isFeasible(cons, soln)).toBe(true)
      expect(soln[nVar + 1]).toBeCloseTo(err, 8)
    })
  })

  test('matches brute force on random small LPs', () => {
    let seed = 20240607 // Same problems the `solveLP` fuzz test uses
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const randInt = (lo: number, hi: number) =>
      lo + Math.floor(rand() * (hi - lo + 1))

    let solved = 0
    for (let trial = 0; trial < 200; trial++) {
      const nVar = randInt(2, 3),
        nCons = randInt(3, 5)
      const c = Array.from({ length: nVar }, () => randInt(-10, 10))
      const Ab = Array.from({ length: nCons }, () => [
        ...Array.from({ length: nVar }, () => randInt(-10, 10)),
        randInt(0, 10),
      ])

      let xOpt: number[]
      try {
        xOpt = solveLPBland(c, Ab)
      } catch (e) {
        expect((e as Error).message).toMatch(/INFEASIBLE|UNBOUNDED/)
        continue
      }
      solved++
      expect(isFeasible(Ab, xOpt)).toBe(true)
      expect(objective(c, xOpt)).toBeCloseTo(bruteForceMin(c, Ab), 6)
    }
    expect(solved).toBe(165) // Same count `solveLP` reaches on this seed
  })
})
