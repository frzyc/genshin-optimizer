function pivotInplace(A: number[][], { i, j }: { i: number, j: number }) {
  const Aij = A[i][j]
  for (let h = 0; h < A.length; h++) {
    if (h === i) continue
    for (let k = 0; k < A[0].length; k++) {
      if (k === j) continue
      A[h][k] -= A[i][k] * A[h][j] / Aij
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

function findPiv1(A: number[][]) {
  const r = A.length, c = A[0].length
  let minloc = { i: -1, j: -1, cmp: Infinity }
  for (let j = 0; j < c - 1; j++) {
    if (A[r - 1][j] >= 0) continue
    for (let i = 0; i < r - 1; i++) {
      if (A[i][j] > 1e-5) {
        const cmp = A[i][c - 1] / A[i][j]
        if (cmp < minloc.cmp) minloc = { i, j, cmp }
      }
    }

    if (minloc.i < 0) throw Error('UNBOUNDED FEASIBLE')
  }
  if (minloc.i < 0) throw Error('NO PIVOTS (done)')
  return { i: minloc.i, j: minloc.j }
}

function findPiv2(A: number[][]) {
  const r = A.length, c = A[0].length
  let minloc = { i: -1, j: -1, cmp: Infinity }
  for (let i = 0; i < r - 1; i++) {
    if (A[i][c - 1] >= 0) continue
    for (let j = 0; j < c - 1; j++) {
      if (A[i][j] < -1e-5) {
        const cmp = A[i][c - 1] / A[i][j]
        if (cmp < minloc.cmp) minloc = { i, j, cmp }
      }
    }

    if (minloc.i < 0) throw Error('INFEASIBLE')
    return { i: minloc.i, j: minloc.j }
  }
  throw Error('NO PIVOTS (done)')
}

function backtrack(tableau: number[][], ijTrack: { i: number, j: number }[], targ: number) {
  let side = 1;  // 0 left, 1 right
  ijTrack.forEach(({ i, j }) => {
    if (side === 1 && j === targ) {
      targ = i
      side = 0
    }
    else if (side === 0 && i === targ) {
      targ = j
      side = 1
    }
  })

  const ncol = tableau[0].length
  return side === 0 ? tableau[targ][ncol - 1] : 0
}

/**
 * Solve a Linear Program defined by:
 *              min  c^T x
 *               x
 *   Subject to:     Ax <= b
 *                    x >= 0
 *
 * Implemented according to:
 *   https://www.math.ucla.edu/~tom/LP.pdf
 *
 * Does not implement any cycle detection, though that *shouldnt* a problem for GO's use
 *   case. This algorithm is fairly numerically unstable though, use with care & always
 *   try to verify the solution. It's also a fair bit slower than it needs to be.
 *
 * @param c        Objective vector
 * @param Ab       Constraints matrix with thresholds. Inputted in block form [A, b]
 * @returns        the optimal solution x
 */
export function solveLP(c: number[], Ab: number[][]) {
  const rows = Ab.length + 1
  const cols = Ab[0].length

  const tableau = Array(rows).fill(0).map(_ => Array(cols).fill(0))
  Ab.forEach((Ai, i) => Ai.forEach((Aij, j) => tableau[i][j] = Aij))
  c.forEach((cj, j) => tableau[rows - 1][j] = cj)

  const ijTrack: { i: number, j: number }[] = []

  while (tableau.some((t, i) => i < rows - 1 && t[cols - 1] < 0)) {
    const ij = findPiv2(tableau)
    ijTrack.push(ij)
    pivotInplace(tableau, ij)
  }

  while (tableau[rows - 1].some((t, j) => j < cols - 1 && t < 0)) {
    const ij = findPiv1(tableau)
    ijTrack.push(ij)
    pivotInplace(tableau, ij)
  }

  return c.map((_, i) => backtrack(tableau, ijTrack, i))
}
