function pivot(A: number[][], ij: { i: number, j: number }) {
  const { i, j } = ij
  const Aij = A[i][j]
  return A.map((Ah, h) => Ah.map((Ahk, k) => {
    if (h === i && k === j) return 1 / Aij;
    if (h === i) return A[i][k] / Aij;
    if (k === j) return -A[h][j] / Aij;
    return Ahk - A[i][k] * A[h][j] / Aij;
  }))
}

function findPiv1(A: number[][]) {
  const r = A.length, c = A[0].length
  let minloc = { i: -1, j: -1, cmp: Infinity }
  for (let j = 0; j < c - 1; j++) {
    if (A[r - 1][j] < 0) {
      for (let i = 0; i < r - 1; i++) {
        if (A[i][j] > 0) {
          const cmp = A[i][c - 1] / A[i][j]
          if (cmp < minloc.cmp) minloc = { i, j, cmp }
        }
      }

      if (minloc.i < 0) throw Error('UNBOUNDED FEASIBLE')
      return { i: minloc.i, j: minloc.j }
    }
  }

  throw Error('NO PIVOTS')
}

function findPiv2(A: number[][]) {
  const r = A.length, c = A[0].length
  let minloc = { i: -1, j: -1, cmp: Infinity }
  for (let i = 0; i < r - 1; i++) {
    if (A[i][c - 1] < 0) {
      for (let j = 0; j < c - 1; j++) {
        if (A[i][j] < 0) {
          const cmp = A[i][c - 1] / A[i][j]
          if (cmp < minloc.cmp) minloc = { i, j, cmp }
        }
      }

      if (minloc.i < 0) throw Error('INFEASIBLE')
      return { i: minloc.i, j: minloc.j }
    }
  }

  throw Error('NO PIVOTS')
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
 * Does not implement any cycle detection.
 * Implemented according to:
 *   https://www.math.ucla.edu/~tom/LP.pdf
 *
 * @param c        Objective vector
 * @param Ab       Constraints matrix with thresholds. Inputted in block for [A, b]
 * @returns        the optimal solution x
 */
export function solveLP(c: number[], Ab: number[][]) {
  let rows = Ab.length + 1
  let cols = Ab[0].length

  let tableau = Array(rows).fill(0).map(_ => Array(cols).fill(0))
  Ab.forEach((Ai, i) => Ai.forEach((Aij, j) => tableau[i][j] = Aij))
  // b.forEach((bi, i) => tableau[i][cols - 1] = bi)
  c.forEach((cj, j) => tableau[rows - 1][j] = cj)

  let ijTrack: { i: number, j: number }[] = []

  while (tableau.some((t, i) => i < rows - 1 && t[cols - 1] < 0)) {
    const ij = findPiv2(tableau)
    ijTrack.push(ij)
    tableau = pivot(tableau, ij)
  }

  while (tableau[rows - 1].some((t, j) => j < cols - 1 && t < 0)) {
    const ij = findPiv1(tableau)
    ijTrack.push(ij)
    tableau = pivot(tableau, ij)
  }

  return c.map((_, i) => backtrack(tableau, ijTrack, i))
}
