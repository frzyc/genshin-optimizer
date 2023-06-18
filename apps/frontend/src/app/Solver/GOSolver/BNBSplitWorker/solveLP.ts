// Matrix convention is row-major, indexed A_{ij} = A[i][j]
type Pivot = { i: number; j: number }
const zero = 1e-8 // Small number equivalent to 0 for numerical instability

/** Checks that all constraints are satisfied (Ax <= b) */
export function isFeasible(Ab: number[][], x: number[]): boolean {
  const b = x.length
  return Ab.every(
    (row) => x.reduce((tot, xi, i) => tot + xi * row[i], 0) <= row[b] + zero
  )
}

/**
 * Solve a Linear Program defined by:
 *              min  c^T x
 *               x
 *   Subject to:     Ax <= b
 *                    x >= 0
 *
 * Implemented according to the Simplex Method (Sec 4) of:
 *   Ferguson, https://www.math.ucla.edu/~tom/LP.pdf
 *
 * Does not implement any cycle detection, though that *shouldnt* be a problem for GO's use
 *   case. This algorithm will always return a feasible solution, though it may be suboptimal.
 *
 * @param c        Objective vector
 * @param Ab       Constraints matrix with thresholds. Inputted in block form [A, b]
 * @returns        a valid solution x, optimal if everything went well.
 */
export function solveLP(c: number[], Ab: number[][]) {
  const rows = Ab.length + 1
  const cols = Ab[0].length

  const tableau = Array(rows)
    .fill(0)
    .map((_) => Array(cols).fill(0))
  Ab.forEach((Ai, i) => Ai.forEach((Aij, j) => (tableau[i][j] = Aij)))
  c.forEach((cj, j) => (tableau[rows - 1][j] = cj))

  const pivotHistory: Pivot[] = [] // Keep track of all chosen pivots for backtracking later

  while (tableau.some((t, i) => i < rows - 1 && t[cols - 1] < -zero)) {
    const piv = findPiv2(tableau)
    pivotHistory.push(piv)
    pivotInplace(tableau, piv)
  }

  while (tableau[rows - 1].some((t, j) => j < cols - 1 && t < -zero)) {
    const piv = findPiv1(tableau)
    pivotHistory.push(piv)
    pivotInplace(tableau, piv)
  }

  const xOpt = c.map((_, i) => backtrack(tableau, pivotHistory, i))
  if (!isFeasible(Ab, xOpt)) throw Error('COMPUTED SOLUTION IS NOT FEASIBLE')
  return xOpt
}

/** Standard `pivot` operation on LPs */
function pivotInplace(A: number[][], { i, j }: Pivot) {
  const Aij = A[i][j]
  for (let h = 0; h < A.length; h++) {
    if (h === i) continue
    for (let k = 0; k < A[0].length; k++) {
      if (k === j) continue
      A[h][k] -= (A[i][k] * A[h][j]) / Aij
    }
  }
  for (let h = 0; h < A.length; h++) {
    if (h === i) continue
    A[h][j] = -A[h][j] / Aij
  }
  for (let k = 0; k < A[0].length; k++) {
    if (k === j) continue
    A[i][k] = A[i][k] / Aij
  }
  A[i][j] = 1 / Aij
}

/** Find a pivot according to Case 1 (Ferguson p23) */
function findPiv1(A: number[][]) {
  const r = A.length,
    c = A[0].length
  let minloc = { i: -1, j: -1, cmp: Infinity }
  for (let j = 0; j < c - 1; j++) {
    if (A[r - 1][j] >= -zero) continue
    for (let i = 0; i < r - 1; i++) {
      if (A[i][j] > zero) {
        const cmp = A[i][c - 1] / A[i][j]
        if (cmp < minloc.cmp) minloc = { i, j, cmp }
      }
    }

    if (minloc.i < 0) throw Error('UNBOUNDED FEASIBLE')
  }
  if (minloc.i < 0) throw Error('NO PIVOTS (done)')
  return { i: minloc.i, j: minloc.j }
}

/** Find a pivot according to Case 2 (Ferguson p24) */
function findPiv2(A: number[][]) {
  const r = A.length,
    c = A[0].length
  let minloc = { i: -1, j: -1, cmp: Infinity }
  for (let i = 0; i < r - 1; i++) {
    if (A[i][c - 1] >= -zero) continue
    for (let j = 0; j < c - 1; j++) {
      if (A[i][j] < -zero) {
        const cmp = A[i][c - 1] / A[i][j]
        if (cmp < minloc.cmp) minloc = { i, j, cmp }
      }
    }

    if (minloc.i < 0) throw Error('INFEASIBLE')
    return { i: minloc.i, j: minloc.j }
  }
  throw Error('NO PIVOTS (done)')
}

/** Backtracking algorithm to find solution vector */
function backtrack(tableau: number[][], pivotHistory: Pivot[], targ: number) {
  let side = 1 // 0 left, 1 right
  pivotHistory.forEach(({ i, j }) => {
    if (side === 1 && j === targ) {
      targ = i
      side = 0
    } else if (side === 0 && i === targ) {
      targ = j
      side = 1
    }
  })

  const ncol = tableau[0].length
  return side === 0 ? tableau[targ][ncol - 1] : 0
}
