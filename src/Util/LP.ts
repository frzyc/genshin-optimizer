import { range } from "./Util"

export type Weights = number[]
export type Constraint = number[]

/**
 * maximize c*x over x >= 0
 * s.t. upper_i >= a_i * x for every upper constraint i
 *
 * @param objective objective weight `c`
 * @param upperCons list of upper constraints, each containing `upper_i` followed by `a_i`
 * @returns the optimal value of `x`
 */
export function maximizeLP(objective: Weights, upperCons: Constraint[]): Weights {
  /// A convergent criss-cross method https://doi.org/10.1080/02331938508843067
  const numX = objective.length, numCons = upperCons.length
  const tableau = [[0, ...objective], ...upperCons]
  const basics = range(numX, numX + numCons), nonBasics = range(-1, numX - 1)
  basics[0] = nonBasics[0] = Infinity // Invalid index marker
  // Pivoting normally divides every term by the pivot. We accumulate
  // them and apply it at the end to keep divisions at minimum.
  let factor = 1

  /** Row `r` satisfying `predicate(tableau[r][c])` with the smallest `basics[r]`, or zero if none exists */
  function minRow(c: number, predicate: (v: number) => boolean): number {
    return tableau.reduce((min, row, r) => (predicate(row[c]) && basics[min] > basics[r]) ? r : min, 0)
  }
  /** Column `c` satisfying `predicate(tableau[r][c])` with the smallest `nonBasics[c]`, or zero if none exists */
  function minCol(r: number, predicate: (v: number) => boolean): number {
    return tableau[r].reduce((min, v, c) => (predicate(v) && nonBasics[min] > nonBasics[c]) ? c : min, 0)
  }
  function enter(entering: number) {
    const leaving = minRow(entering, v => v > 0)
    if (!leaving) throw new Error("Unbounded")
    factor *= pivot(tableau, entering, leaving, basics, nonBasics)
  }
  function leave(leaving: number) {
    const entering = minCol(leaving, v => v < 0)
    if (!entering) throw new Error("Infeasible")
    factor *= pivot(tableau, entering, leaving, basics, nonBasics)
  }
  while (true) {
    const leaving = minRow(0, v => v < 0), entering = minCol(0, v => v > 0)
    // We don't need to check validity of `leaving` and `entering`
    // because `basics[0] == nonBasics[0] == Infinity`
    if (basics[leaving] > nonBasics[entering]) enter(entering)
    else if (leaving) leave(leaving)
    else break
  }
  const result = objective.map(_ => 0)
  basics.forEach((i, j) => j && i < numX && (result[i] = tableau[j][0] / factor))
  return result
}

function pivot(tableau: Constraint[], enter: number, leave: number, basics: number[], nonBasics: number[]): number {
  [basics[leave], nonBasics[enter]] = [nonBasics[enter], basics[leave]]
  const row = [...tableau[leave]], col = tableau.map(row => row[enter]), p = row[enter]
  const factor = p < 0 ? -1 : 1, nRow = tableau.length, nCol = tableau[0].length
  for (let r = 0; r < nRow; r++) for (let c = 0; c < nCol; c++)
    tableau[r][c] = (tableau[r][c] * p - row[c] * col[r]) * factor
  for (let r = 0; r < nRow; r++) tableau[r][enter] = -col[r] * factor
  for (let c = 0; c < nCol; c++) tableau[leave][c] = +row[c] * factor
  tableau[leave][enter] = 1 * factor
  return p * factor
}

/** Debug print tableau */
function printTableau(tableau: number[][], basics: number[], nonBasics: number[]) {
  function rev<T>(x: T[]): T[] { return [...x.slice(1), x[0]] }
  console.log(
    rev(tableau)
      .map(row => rev(row).map(x => x.toString().padStart(3)).join()).join('\n'),
    basics, nonBasics)
}
