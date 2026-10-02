import { isFeasible, pivotInplace, zero } from './solveLP.js'

/**
 * Solve the same Linear Program as `solveLP`, using Bland's Smallest-Subscript Rule (Sec 6) of:
 *   Ferguson, https://www.math.ucla.edu/~tom/LP.pdf
 *
 * Pivots are chosen by the *subscript of the variable* entering/leaving the basis rather than by
 * ratio alone, which is slower than the usual rules but provably cannot cycle. `solveLP` falls
 * back to this when it detects that it is cycling.
 *
 * @param c        Objective vector
 * @param Ab       Constraints matrix with thresholds. Inputted in block form [A, b]
 * @returns        the optimal solution x
 */
export function solveLPBland(c: number[], Ab: number[][]) {
  const nCons = Ab.length,
    nVar = Ab[0].length - 1 // Last column of `Ab` holds the thresholds `b`
  const tableau = Array(nCons + 1)
    .fill(0)
    .map((_) => Array(nVar + 1).fill(0))
  Ab.forEach((Ai, i) => Ai.forEach((Aij, j) => (tableau[i][j] = Aij)))
  c.forEach((cj, j) => (tableau[nCons][j] = cj))

  // Which variable currently sits in each column (nonbasic) and row (basic). Slack variables
  // are numbered after the `nVar` problem variables. Pivoting swaps the two labels.
  const colVar = Array(nVar)
    .fill(0)
    .map((_, j) => j)
  const rowVar = Array(nCons)
    .fill(0)
    .map((_, i) => nVar + i)

  const pivot = (i: number, j: number) => {
    pivotInplace(tableau, { i, j })
    const swap = rowVar[i]
    rowVar[i] = colVar[j]
    colVar[j] = swap
  }

  // Phase 1: pivot the first infeasible row feasible, entering the smallest-subscript variable
  for (;;) {
    const row = tableau.findIndex((t, i) => i < nCons && t[nVar] < -zero)
    if (row < 0) break

    let piv = -1
    for (let j = 0; j < nVar; j++)
      if (tableau[row][j] < -zero && (piv < 0 || colVar[j] < colVar[piv]))
        piv = j
    if (piv < 0) throw Error('INFEASIBLE')
    pivot(row, piv)
  }

  // Phase 2: enter the smallest-subscript improving variable, leave by ratio test with
  //   smallest-subscript tie-breaking. Both halves are what makes cycling impossible.
  for (;;) {
    let enter = -1
    for (let j = 0; j < nVar; j++)
      if (tableau[nCons][j] < -zero && (enter < 0 || colVar[j] < colVar[enter]))
        enter = j
    if (enter < 0) break

    let leave = -1,
      ratio = Number.POSITIVE_INFINITY
    for (let i = 0; i < nCons; i++) {
      if (tableau[i][enter] <= zero) continue
      const cmp = tableau[i][nVar] / tableau[i][enter]
      if (cmp < ratio - zero) {
        ratio = cmp
        leave = i
      } else if (cmp < ratio + zero && leave >= 0 && rowVar[i] < rowVar[leave])
        leave = i
    }
    if (leave < 0) throw Error('UNBOUNDED FEASIBLE')
    pivot(leave, enter)
  }

  // The labels say where each variable ended up instead of backtracking
  const xOpt = c.map((_) => 0)
  rowVar.forEach((v, i) => {
    if (v < c.length) xOpt[v] = tableau[i][nVar]
  })
  if (!isFeasible(Ab, xOpt)) throw Error('COMPUTED SOLUTION IS NOT FEASIBLE')
  return xOpt
}
