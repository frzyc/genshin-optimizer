export type Weights = { [key in string]: number }
export type LPConstraint = { weights: Weights, upperBound?: number, lowerBound?: number }

type IndexObj = { val: number, tmp: number }
type IndexedWeight<Index = IndexObj> = [index: Index, value: number][]
type Equation<Index = IndexObj> = { weights: IndexedWeight<Index>, val: number }

/**
 * maximize c*x
 * s.t. lower_i <= a_i*x <= upper_i for every i
 *
 * @param objective objective weight `c`
 * @param constraints list of constraints, given the weights `a` and lower/upper bounds
 * @returns the optimal value of `x`
 */
export function maximizeLP(objective: Weights, constraints: LPConstraint[]): Weights {
  // Solving the dual problem in https://www.jstor.org/stable/3690376
  const newIdx = (val: number) => ({ val, tmp: 0 }), names = new Map<string, IndexObj>()
  function indexWeights(weights: Weights): IndexedWeight {
    return Object.entries(weights).map(([name, val]) => {
      const index = names.get(name) ?? newIdx(0)
      if (!names.has(name)) names.set(name, index)
      return [index, val]
    })
  }

  // Using the same variable names as the linked paper

  const b = indexWeights(objective), At: IndexedWeight[] = [], c: number[] = []
  for (const { weights: dense, lowerBound, upperBound } of constraints) {
    const weights = indexWeights(dense)
    if (upperBound !== undefined) { At.push(weights); c.push(upperBound) }
    if (lowerBound !== undefined) {
      At.push(weights.map(([index, val]): IndexedWeight[number] => [index, -val]))
      c.push(-lowerBound)
    }
  }

  /**
   * maximize b*y over y
   * s.t. At*y <= c
   *
   * using predictor-corrector method
   */

  const y = [...names.values()], x = At.map(_ => newIdx(1)), s = x.map(_ => newIdx(1))
  const tau = newIdx(1), theta = newIdx(1), kappa = newIdx(1)
  const yMap = new Map(y.map((idx, i) => [idx, i]))

  const newEq = (): Equation => ({ weights: [], val: 0 })
  let nullEq: Equation[] = [], bc_bar_norm: number

  // b_bar is initialized below
  {
    // Null space equations, eq 11 in the paper
    const eq1 = y.map(newEq), eq2 = x.map(_ => newEq()), eq3 = newEq(), eq4 = newEq()
    const b_bar = Array<number>(y.length).fill(0), c_bar = c.map(c => c - 1), z_bar = c.reduce((accu, c) => accu + c, 1)
    At.forEach((a, iX) => {
      a.forEach(([_iY, val]) => {
        const iY = yMap.get(_iY)!
        b_bar[iY] -= val // initialize b_bar
        eq1[iY].weights.push([x[iX], val])
        eq2[iX].weights.push([y[iY], -val])
      })
    })
    b.forEach(([_iY, val]) => {
      const iY = yMap.get(_iY)!
      b_bar[iY] += val // initialize b_bar
      eq1[iY].weights.push([tau, -val])
      eq3.weights.push([y[iY], val])
    })
    // b_bar is initialized
    c.forEach((val, iX) => {
      eq2[iX].weights.push([tau, val])
      eq3.weights.push([x[iX], -val])
    })
    b_bar.forEach((val, iY) => {
      eq1[iY].weights.push([theta, val])
      eq4.weights.push([y[iY], -val])
    })
    c_bar.forEach((val, iX) => {
      eq2[iX].weights.push([theta, -val])
      eq4.weights.push([x[iX], val])
    })
    s.forEach((idx, iX) => eq2[iX].weights.push([idx, -1]))
    eq3.weights.push([theta, z_bar], [kappa, -1])
    eq4.weights.push([tau, -z_bar])

    nullEq = [...eq1, ...eq2, eq3, eq4]
    bc_bar_norm = Math.sqrt([...b_bar, ...c_bar].reduce((accu, val) => accu + val * val, 0))
  }

  const xTau = [...x, tau], sKappa = [...s, kappa], n1 = xTau.length
  for (let round = 0; round < 1000; round++) {
    {
      // Exit condition
      // TODO: Figure out a good tolerance
      const t = tau.val, e1 = 1e-10 * t * t, e2 = 1e-10 * t, e3 = 1e-10
      const val1 = x.reduce((accu, { val }, i) => accu += val * s[i].val, 0)

      if (val1 <= e1 && theta.val * bc_bar_norm <= e2) {
        // optimal
        const t = tau.val
        return Object.fromEntries([...names.entries()].map(([name, { val }]) => [name, val / t]))
      }
      if (t < e3)
        throw new Error("Infeasible")
    }

    // eq 12 in the paper
    const xEq = xTau.map(newEq)
    xTau.forEach((idx, i) => {
      xEq[i].val -= idx.val * sKappa[i].val
      xEq[i].weights.push([sKappa[i], xTau[i].val], [xTau[i], sKappa[i].val])
    })

    if (round % 2) { // corrector
      const mu = xTau.reduce((accu, { val }, i) => accu + val * sKappa[i].val, 0) / n1
      xEq.forEach(eq => eq.val += mu)
    }

    const weights = solveLPEq([...nullEq, ...xEq])!
    weights.forEach((val, idx) => idx.tmp = val)

    let alpha = 1 // corrector
    if (!(round % 2)) {
      // predictor
      if (centrality(0.75, xTau, sKappa) <= 0.5) alpha = 0.75
      else {
        const mu = xTau.reduce((accu, x, i) => accu + x.val * sKappa[i].val, 0) / n1
        const Pq = xTau.reduce((agg, x, i) => agg + (x.tmp * x.tmp * sKappa[i].tmp * sKappa[i].tmp), 0)
        // Guaranteed valid from https://www.jstor.org/stable/3690133, lemma 4
        alpha = Math.min(0.5, Math.sqrt(mu) / Math.sqrt(8 * Pq))
      }
    }
    xTau.forEach(x => x.val += alpha * x.tmp)
    sKappa.forEach(s => s.val += alpha * s.tmp)
    y.forEach(y => y.val += alpha * y.tmp)
    theta.val += alpha * theta.tmp

    weights.forEach((_, idx) => idx.tmp = 0)
  }

  throw new Error("Round limit exceeded")
}

function centrality(alpha: number, xTau: IndexObj[], sKappa: IndexObj[]) {
  const vec = xTau.map((x, i) => (x.val + alpha * x.tmp) * (sKappa[i].val + alpha * sKappa[i].tmp))
  const mu = vec.reduce((accu, x) => accu + x, 0) / vec.length
  return Math.sqrt(vec.map(x => x / mu - 1).reduce((accu, x) => accu + x * x, 0))
}

function solveLPEq<Index>(equations: Equation<Index>[]): Map<Index, number> | undefined {
  const special = {} as Index, eqs = equations.map(eq => new Map([[special, eq.val], ...eq.weights.filter(e => e[1])]))
  /** j := j - (j[key]/i[key]) i , eliminating `key` from `j`. Requires `i[key] != 0` */
  function subtract(i: number, j: number, key: Index, w: number) {
    const eqi = eqs[i], eqj = eqs[j], wi = w, wj = eqj.get(key)
    if (wj) {
      eqi.forEach((v, k) => {
        const newV = (eqj.get(k) ?? 0) - v * wj / wi;
        (newV || k === special) ? eqj.set(k, newV) : eqj.delete(k)
      })
      eqj.delete(key)
    }
  }
  // Gaussian Elimination
  const headKey = new Map<number, Index>()
  for (let i = 0; i < eqs.length; i++) {
    const eqi = eqs[i]
    if (eqi.size < 2) {
      // TODO: Figure out a good tolerance
      if (Math.abs(eqi.get(special)!) > 1e-12) return undefined
      continue
    }
    const [_, ...entries] = eqi.entries()
    const [key, wi] = entries.reduce((best, x) => Math.abs(best[1]) < Math.abs(x[1]) ? x : best)
    headKey.set(i, key)
    for (let j = i + 1; j < eqs.length; j++) subtract(i, j, key, wi)
  }
  // eqs is now in row echelon form
  const weights = new Map<Index, number>()
  for (let i = eqs.length - 1; i >= 0; i--) {
    const eqi = eqs[i]
    if (eqi.size < 2) continue
    const [[_, c], ...terms] = eqi.entries(), head = headKey.get(i)!, hWeight = eqi.get(head)!
    let value = c
    for (const [index, w] of terms)
      if (head !== index) value -= w * (weights.get(index) ?? 0)
    if (value) weights.set(head, value / hWeight)
  }

  return weights
}

export const testExport = { solveLPEq }
