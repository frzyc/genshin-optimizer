export type Weights = { [key in string]: number }
export type LPConstraint = { weights: Weights, upperBound?: number, lowerBound?: number }

/**
 * maximize c*x over x >= 0
 * s.t. lower_i <= a_i*x <= upper_i for every constraint i
 *
 * @param objective objective weight `c`
 * @param constraints list of constraints, given the weights `a` and lower/upper bounds
 * @returns the optimal value of `x`
 */
export function maximizeLP(objective: Weights, constraints: LPConstraint[]): Weights {
  const xKeys = [...new Set([
    ...Object.keys(objective), ...constraints.flatMap(con => Object.keys(con.weights))
  ])]

  const eqCons = constraints.filter(con => con.upperBound === con.lowerBound && con.upperBound !== undefined)
  const upperCons = constraints.filter(con => con.upperBound !== con.lowerBound && con.upperBound !== undefined)
  const lowerCons = constraints.filter(con => con.upperBound !== con.lowerBound && con.lowerBound !== undefined)
  const numX = xKeys.length, numU = upperCons.length, numL = lowerCons.length
  const numS = numU + numL, numVars = numX + numS, numCons = numS + eqCons.length

  /** Tableau from https://en.wikipedia.org/wiki/Simplex_algorithm
   *                  x | s1 | s2 | phase1 s1 | phase1 s2 | sum
   * -------------------*----*----*-----------*-----------*-----
   *  upper constraints |  I |  0 |    +-I    |     0     |
   *  lower constraints |  0 | -I |     0     |    +-I    |
   *   eq constraints   |  0 |  0 |     0     |     0     |
   *     objective      |  0 |  0 |     0     |     0     |
   *    phase 1 obj     |  0 |  0 |    -1     |    -1     |
   */
  const tableau = [...upperCons, ...lowerCons, ...eqCons].map(({ weights }) =>
    [...xKeys.map(key => weights[key] ?? 0), ...Array<number>(numS + numCons).fill(0)])

  upperCons.forEach((con, i) => { tableau[i].push(con.upperBound!); tableau[i][numX + i] = 1 })
  lowerCons.forEach((con, i) => { tableau[numU + i].push(con.lowerBound!); tableau[i + numU][numX + numU + i] = -1 })
  eqCons.forEach((con, i) => { tableau[numS + i].push(con.lowerBound!) })
  for (let i = 0; i < numCons; i++) {
    if (tableau[i][numVars + numCons] < 0) tableau[i].forEach((w, i, arr) => arr[i] = -w)
    tableau[i][numVars + i] = 1
  }

  tableau.push(
    [...xKeys.map(key => objective[key] ?? 0), ...Array<number>(numS + numCons + 1).fill(0)],
    [...Array<number>(numVars).fill(0), ...Array<number>(numCons).fill(-1), 0])
  const obj = tableau[numCons + 1]
  for (let i = 0; i < numCons; i++) tableau[i].forEach((w, c) => obj[c] += w)

  const basic = new Map(Array(numCons).fill(0).map((_, i) => [i, numVars + i]))
  // Adjust the maximum distance from the boundary (`threshold`) to account for the numerical stability
  const threshold = tableau[numCons + 1][numVars + numCons] * 1e-12 / numCons
  maximize_canonical(tableau, basic, numCons)

  if (Math.abs(tableau[numCons + 1][numVars + numCons]) > threshold) throw new Error("Infeasible")
  tableau.pop()
  tableau.forEach(row => row.splice(numVars, numCons))

  maximize_canonical(tableau, basic, numCons)

  const result = Object.fromEntries(xKeys.map(key => [key, 0]))
  basic.forEach((c, r) => c < numX && (result[xKeys[c]] = tableau[r][numVars] / tableau[r][c]))
  return result
}

/**
 * Given each `basic[r]` is the basic column of row `r`, Maximize objective using canonical tableau
 *
 *   weights  | val
 * -----------*----
 *  objective |  0
 */
function maximize_canonical(tableau: number[][], basic: Map<number, number>, lastRow: number) {
  const basicCols = new Set([...basic.values()])
  const numRow = tableau.length, numCol = tableau[0].length, objective = tableau[numRow - 1]
  while (true) {
    // Using Bland's Rule: https://en.wikipedia.org/wiki/Bland%27s_rule
    const ipCol = objective.findIndex((val, c) => val > 0 && !basicCols.has(c))
    if (ipCol === -1 || ipCol === numCol - 1) break
    let minVal = Infinity, ipRow = -1
    tableau.slice(0, lastRow).forEach((row, i) => {
      if (row[ipCol] > 0) {
        const val = row[numCol - 1] / row[ipCol]
        if (minVal > val) [minVal, ipRow] = [val, i]
      }
    })
    if (ipRow === -1) break
    const pRow = tableau[ipRow]

    for (let r = 0; r < numRow; r++) {
      const row = tableau[r], factor = row[ipCol] / pRow[ipCol]
      if (r === ipRow || !factor) continue
      for (let c = 0; c < numCol; c++) row[c] -= pRow[c] * factor
      row[ipCol] = 0
    }
    basicCols.delete(basic.get(ipRow)!)
    basic.set(ipRow, ipCol)
    basicCols.add(ipCol)
  }
}
