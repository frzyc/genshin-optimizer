export type Weights = { [key in string]: number }
export type LPConstraint = { weights: Weights, upperBound?: number, lowerBound?: number }

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
  const yMap = new Map<string, number>()
  function registerY(key: string): number {
    const old = yMap.get(key)
    if (old !== undefined) return old
    yMap.set(key, yMap.size)
    return yMap.size - 1
  }

  // Using the same variable names as the linked paper
  const At: [iy: number, val: number][][] = [], c: number[] = []
  Object.entries(objective).forEach(([y]) => registerY(y))
  for (const { weights: input, lowerBound, upperBound } of constraints) {
    const weights = Object.entries(input).map(([y, val]): [number, number] => [registerY(y), val])
    if (upperBound !== undefined) { At.push(weights); c.push(upperBound) }
    if (lowerBound !== undefined) {
      At.push(weights.map(([index, val]): [number, number] => [index, -val]))
      c.push(-lowerBound)
    }
  }
  // yMap is initialized
  const b = Array<number>(yMap.size).fill(0)
  Object.entries(objective).forEach(([y, val]) => b[yMap.get(y)!] = val)
  const denseAt = At.map(row => {
    const dense = Array<number>(yMap.size).fill(0)
    row.forEach(([iy, val]) => dense[iy] = val)
    return dense
  })

  /**
   * maximize b*y over y
   * s.t. At*y <= c
   *
   * using predictor-corrector method
   */
  const numX = At.length, numY = yMap.size
  const x = Array<number>(numX).fill(1), y = Array<number>(numY).fill(0), s = [...x]
  let tau = 1, theta = 1, kappa = 1

  const minus_b_bar = b.map(b => -b), minus_c_bar = c.map(c => 1 - c), z_bar = c.reduce((accu, c) => accu + c, 1)
  At.forEach(at => at.forEach(([iy, val]) => minus_b_bar[iy] += val))

  // Preallocated variables
  const dx = [...x], dy = [...y], ds = [...s], xs = [...x], centX_tmp = [...x], xInvS = [...x], minus_r_prim = [...y].fill(0)
  const dy_1 = [...y], dy_tau = [...y], dy_theta = [...y], dx_1 = [...x], dx_tau = [...x], dx_theta = [...x]
  const bc_bar_norm = Math.sqrt(minus_b_bar.reduce((accu, b) => accu + b * b, 0) + minus_c_bar.reduce((accu, c) => accu + c * c, 0))
  const eqe = Array(numY).fill(0).map(_ => Array(numY).fill(0))

  function try_create_result(): Weights | undefined {
    const ixs: number[] = []
    for (let ix = 0; ix < numX; ix++)
      if (x[ix] > s[ix]) ixs.push(ix)

    const numVars = ixs.length + numY + 1, iTK = numVars - 1
    const vars = Array<number>(numVars).fill(0), d = [...vars], lambdas = [...vars], invQ = [...vars].fill(1)
    const cb = [...y.map(y => -y), ...ixs.map(ix => -x[ix]), 0], Bt = ixs.map(ix => At[ix])
    const constraintsT = Array(numVars).fill(0).map(_ => Array<number>(numVars).fill(0))
    Bt.forEach((bt, ixb) => bt.forEach(([iy, val]) => {
      constraintsT[ixb + numY][iy] = val
      constraintsT[iy][ixb + numY] = -val
    }))
    b.forEach((b, iy) => {
      constraintsT[iTK][iy] = -b
      constraintsT[iy][iTK] = b
    })
    if (tau >= kappa) {
      cb[iTK] = -tau
      ixs.forEach((ix, ixb) => {
        constraintsT[iTK][ixb + numY] = c[ix]
        constraintsT[ixb + numY][iTK] = -c[ix]
      })
    } else {
      cb[iTK] = -kappa
      constraints[iTK][iTK] = -1
    }

    try {
      solveQP(invQ, cb, constraintsT, d, vars, lambdas)
    } catch {
      return undefined
    }
    if (kappa > tau) throw new Error("Unbounded or Infeasible")
    const tk = vars[iTK], result: Weights = {}
    yMap.forEach((iy, key) => result[key] = vars[iy] / tk)
    return result
  }

  for (let round = 0; round < 300; round++) {
    const current_centrality = centrality(x, s, tau, kappa)
    if (current_centrality >= ((round % 2) ? 0.5 : 0.25))
      throw new Error(`Bad centrality at round ${round}`)

    x.forEach((x, ix) => {
      xs[ix] = x * s[ix]
      xInvS[ix] = x / s[ix]
    })
    const isPredictor = !(round % 2), gamma = isPredictor ? 0 : 1, tau_kappa = tau * kappa
    const mu = xs.reduce((a, b) => a + b, tau_kappa) / (numX + 1)

    {
      // Exit condition
      const e1 = 1e-4, e2 = 1e-4, e3 = 1e-9
      const condition1 = mu / tau / tau, condition2 = bc_bar_norm * theta / tau
      if (!(round % 3) && condition1 <= e1 && condition2 <= e2) {
        // Early exit if we can find something
        const result = try_create_result()
        if (result) return result
      }
      if (tau <= e3) throw new Error("Unbounded or Infeasible")
    }

    // These rounding errors/residuals accumulate over time,
    // so we have to nudge them back during a corrector step
    const correctingResidual = (round & 31) === 31
    let r_tau = 0
    if (correctingResidual) {
      s.fill(0)
      kappa = 0
      At.forEach((at, ix) => at.forEach(([iy, val]) => {
        minus_r_prim[iy] -= val * x[ix]
        s[ix] -= val * y[iy]
      }))
      b.forEach((b, iy) => {
        minus_r_prim[iy] += b * tau
        kappa += b * y[iy]
      })
      minus_b_bar.forEach((b, iy) => {
        minus_r_prim[iy] += b * theta
        r_tau += b * y[iy]
      })
      c.forEach((c, ix) => {
        s[ix] += c * tau
        kappa -= c * x[ix]
      })
      minus_c_bar.forEach((c, ix) => {
        r_tau -= c * x[ix]
        s[ix] += c * theta
      })
      r_tau += (numX + 1) - z_bar * tau
      kappa += z_bar * theta
    }

    // Write dy in terms of dtau and dtheta
    // dx = dx_1 + dx_tau * dtau + dx_theta * dtheta
    // dy = dy_1 + dy_tau * dtau + dy_theta * dtheta
    const centX = !gamma ? s : (s.forEach((s, ix) => centX_tmp[ix] = s - gamma * mu / x[ix]), centX_tmp)
    try {
      solveQP(xInvS, centX, denseAt, minus_r_prim, dx_1, dy_1, eqe, true)
      solveQP(xInvS, c, denseAt, b, dx_tau, dy_tau, eqe, false)
      solveQP(xInvS, minus_c_bar, denseAt, minus_b_bar, dx_theta, dy_theta, eqe, false)
      if (correctingResidual) minus_r_prim.fill(0)
    } catch {
      // When we're getting too close to the boundary, a lot of numerical instability occurs.
      // If we went off the rail too much into infeasible region, these solvers will likely fail.
      break
    }
    dy_1.forEach((v, i, arr) => arr[i] = -v)
    dy_tau.forEach((v, i, arr) => arr[i] = -v)
    dy_theta.forEach((v, i, arr) => arr[i] = -v)

    // [  kappa ; tau * z_bar ] * [ dtau   ] + [ -tau c^T ; tau b^T ] * [ dx - dx_1 ]
    // [ -z_bar ;     0       ]   [ dtheta ]   [  c_bar^T ; b_bar^T ]   [ dy - dy_1 ]
    //                              =
    //                  [ m11 m12 ] * [ dtau   ]
    //                  [ m21 m22 ]   [ dtheta ]
    //                              =
    // [ gamma * mu - tau * kappa ] - [ -tau c^T ; tau b^T ] * [ dx_1 ]
    // [            0             ]   [  c_bar^T ; b_bar^T ]   [ dy_1 ]
    const m11 = kappa
      - tau * dx_tau.reduce((accu, dx, ix) => accu + c[ix] * dx, 0)
      + tau * dy_tau.reduce((accu, dy, iy) => accu + b[iy] * dy, 0)
    const m12 = tau * z_bar
      - tau * dx_theta.reduce((accu, dx, ix) => accu + c[ix] * dx, 0)
      + tau * dy_theta.reduce((accu, dy, iy) => accu + b[iy] * dy, 0)
    const m1 = gamma * mu - tau_kappa
      + tau * dx_1.reduce((accu, dx, ix) => accu + c[ix] * dx, 0)
      - tau * dy_1.reduce((accu, dy, iy) => accu + b[iy] * dy, 0)
    const m21 = -z_bar
      - dx_tau.reduce((accu, dx, ix) => accu + minus_c_bar[ix] * dx, 0)
      + dy_tau.reduce((accu, dy, iy) => accu + minus_b_bar[iy] * dy, 0)
    const m22 = 0
      - dx_theta.reduce((accu, dx, ix) => accu + minus_c_bar[ix] * dx, 0)
      + dy_theta.reduce((accu, dy, iy) => accu + minus_b_bar[iy] * dy, 0)
    const m2 = -r_tau
      + dx_1.reduce((accu, dx, ix) => accu + minus_c_bar[ix] * dx, 0)
      - dy_1.reduce((accu, dy, iy) => accu + minus_b_bar[iy] * dy, 0)
    const det = m11 * m22 - m21 * m12, dtau = (m1 * m22 - m2 * m12) / det, dtheta = (m11 * m2 - m21 * m1) / det

    dx_1.forEach((d, ix) => dx[ix] = d + dx_tau[ix] * dtau + dx_theta[ix] * dtheta)
    dy_1.forEach((d, iy) => dy[iy] = d + dy_tau[iy] * dtau + dy_theta[iy] * dtheta)
    c.forEach((c, ix) => ds[ix] = c * dtau + minus_c_bar[ix] * dtheta)
    At.forEach((at, ix) => at.forEach(([iy, val]) => ds[ix] -= dy[iy] * val))
    const dkappa = z_bar * dtheta
      - dx.reduce((accu, dx, ix) => accu + c[ix] * dx, 0)
      + dy.reduce((accu, dy, iy) => accu + b[iy] * dy, 0)

    let alpha: number
    if (isPredictor) {
      if (centrality(x, s, tau, kappa, { alpha: 0.75, dx, ds, dtau, dkappa }) < 0.5) {
        alpha = 0.75
      } else {
        const Pq = xs.reduce((accu, xs) => accu + xs * xs, tau_kappa * tau_kappa)
        // Guaranteed valid from https://www.jstor.org/stable/3690133, lemma 4
        alpha = Math.min(0.5, Math.sqrt(mu) / Math.sqrt(8 * Pq))
        // but numerical stability means we may need to nudge it a few times
        for (; alpha >= 1e-6; alpha /= 1.05)
          if (centrality(x, s, tau, kappa, { alpha, dx, ds, dtau, dkappa }) <= 0.5)
            break
      }
    } else alpha = 1

    /**
     * Even though directly computing `s` and `kappa`
     * have the same number of computation, we use `ds`
     * and `dkappa` instead as the centrality checking
     * assumes those to be the accurate update direction.
     *
     * We'll fix the accumulated rounding errors, together
     * with other residuals in later correction steps.
     */
    dx.forEach((dx, ix) => x[ix] += alpha * dx)
    dy.forEach((dy, iy) => y[iy] += alpha * dy)
    ds.forEach((ds, ix) => s[ix] += alpha * ds)
    tau += alpha * dtau
    theta += alpha * dtheta
    kappa += alpha * dkappa
  }

  const result = try_create_result()
  if (!result) throw new Error("LP Algorithm doesn't converge")
  return result
}

function printResidual(round: number,
  x: number[], y: number[], s: number[],
  At: [iy: number, val: number][][], b: number[], c: number[],
  b_bar: number[], c_bar: number[], z_bar: number,
  tau: number, theta: number, kappa: number) {
  const test1 = Array<number>(y.length).fill(0), test2 = Array<number>(x.length).fill(0)
  let test3 = 0, test4 = 0
  At.forEach((at, ix) => at.forEach(([iy, val]) => {
    test1[iy] += val * x[ix]
    test2[ix] -= val * y[iy]
  }))
  b.forEach((b, iy) => {
    test1[iy] -= b * tau
    test3 += b * y[iy]
  })
  b_bar.forEach((b, iy) => {
    test1[iy] += b * theta
    test4 -= b * y[iy]
  })
  c.forEach((c, ix) => {
    test2[ix] += c * tau
    test3 -= c * x[ix]
  })
  c_bar.forEach((c, ix) => {
    test2[ix] -= c * theta
    test4 += c * x[ix]
  })
  s.forEach((s, ix) => test2[ix] -= s)
  test3 += z_bar * theta - kappa
  test4 += (x.length + 1) - z_bar * tau
  console.log("Residual", round,
    test1.reduce((worst, x) => Math.max(worst, Math.abs(x)), -Infinity),
    test2.reduce((worst, x) => Math.max(worst, Math.abs(x)), -Infinity),
    test3, test4)
}

function centrality(x: number[], s: number[], tau: number, kappa: number,
  diff?: { alpha: number, dx: number[], ds: number[], dtau: number, dkappa: number }) {
  let sum_square: number, sum: number
  if (diff) {
    const { alpha, dx, ds, dtau, dkappa } = diff
    sum = (tau + alpha * dtau) * (kappa + alpha * dkappa)
    sum_square = sum * sum
    x.forEach((x, i) => {
      const xs = (x + alpha * dx[i]) * (s[i] + alpha * ds[i])
      sum += xs
      sum_square += xs * xs
    })
  } else {
    sum = tau * kappa
    sum_square = sum * sum
    x.forEach((x, i) => {
      const xs = x * s[i]
      sum += xs
      sum_square += xs * xs
    })
  }
  const n = x.length + 1, mu = sum / n
  return sum_square / mu / mu - n
}

/**
 * min  1/2 x^t diag(q) x  + c^t x
 * s.t.  Ex = d
 *
 * Equivalently, solve
 *
 * [ diag(q)  E^T ][    x   ] = [ -c ]
 * [    E      0  ][ lambda ] = [  d ]
 *
 * Precondition: All arrays must have correction dimensions.
 */
function solveQP(invQ: readonly number[], c: readonly number[], Et: readonly number[][], d: readonly number[], x: number[], lambda: number[], eqe?: number[][], calcEQE?: boolean) {
  // Solving equality-constrained QP using Schur's complement
  if (!eqe || calcEQE) {
    // eqe = E invQ E^T
    const numL = d.length
    if (!eqe) eqe = Array(numL).fill(0).map(_ => Array(numL))
    eqe.forEach(row => row.fill(0))
    Et.forEach((col, ix) =>
      col.forEach((e, il1) => {
        for (let il2 = il1; il2 < numL; il2++)
          eqe![il1][il2] += invQ[ix] * e * col[il2]
      }))
    for (let il1 = 0; il1 < numL; il1++)
      for (let il2 = il1 + 1; il2 < numL; il2++)
        eqe[il2][il1] = eqe[il1][il2]
  }
  // lambda = (E invQ E^T)^-1 (-1)(d + E invQ c)
  d.forEach((d, il) => lambda[il] = -d)
  Et.forEach((col, ix) => col.forEach((e, il) => lambda[il] -= e * invQ[ix] * c[ix]))
  if (!solveLPEq(eqe, lambda))
    throw new Error("Illformed/Infeasible Quadratic Programming")

  // x = -invQ (c + E^t lambda)
  Et.forEach((col, ix) => x[ix] = -invQ[ix] * col.reduce((accu, e, il) => accu + e * lambda[il], c[ix]))
}

function solveLPEq(_eqs: readonly number[][], vals: number[]): number[] | undefined {
  const eqs = [..._eqs]

  /** j := j - (j[key]/i[key]) i , eliminating `key` from `j`. Requires `i[key] != 0` */
  function eliminate(i: number, j: number, key: number) {
    const eqi = eqs[i], weight = eqs[j][key] / eqi[key]
    if (weight) {
      eqs[j] = eqs[j].map((val, index) => val - weight * eqi[index])
      vals[j] -= weight * vals[i]
    }
    eqs[j][key] = 0
  }
  // Gaussian Elimination
  for (let i = 0; i < vals.length; i++) {
    let bestI = i
    for (let j = i + 1; j < vals.length; j++)
      if (Math.abs(eqs[bestI][i]) < Math.abs(eqs[j][i])) bestI = j
    if (bestI !== i) {
      [eqs[bestI], eqs[i]] = [eqs[i], eqs[bestI]];
      [vals[bestI], vals[i]] = [vals[i], vals[bestI]]
    }
    if (Math.abs(eqs[i][i]) >= 1e-16)
      for (let j = i + 1; j < vals.length; j++) eliminate(i, j, i)
  }
  // eqs is now an upper triangular matrix
  for (let i = eqs.length - 1; i >= 0; i--) {
    const eqi = eqs[i]
    let sum = vals[i]
    for (let j = i + 1; j < eqi.length; j++) sum -= eqi[j] * vals[j]
    if (Math.abs(eqs[i][i]) < 1e-16)
      if (Math.abs(sum) >= 1e-15) return undefined // Infeasible row
      else continue
    vals[i] = sum / eqi[i]
  }
  return vals
}

export const testExport = { solveLPEq, solveQP }
