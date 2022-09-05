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
  const yMap = new Map([...new Set([...Object.keys(objective), ...constraints.flatMap(c => Object.keys(c.weights))])].map((x, i) => [x, i]))

  // Using the same variable names as the linked paper
  const b = Array<number>(yMap.size).fill(0), At: [iy: number, val: number][][] = [], c: number[] = []
  Object.entries(objective).forEach(([y, val]) => b[yMap.get(y)!] = val)
  for (const { weights: input, lowerBound, upperBound } of constraints) {
    const weights = Object.entries(input).map(([y, val]): [number, number] => [yMap.get(y)!, val])
    if (upperBound !== undefined) { At.push(weights); c.push(upperBound) }
    if (lowerBound !== undefined) {
      At.push(weights.map(([index, val]): [number, number] => [index, -val]))
      c.push(-lowerBound)
    }
  }

  /**
   * maximize b*y over y
   * s.t. At*y <= c
   *
   * using predictor-corrector method
   */
  const y = Array<number>(yMap.size).fill(0), x = Array<number>(At.length).fill(1), s = [...x]
  let tau = 1, theta = 1, kappa = 1
  const asxa: number[][] = Array<number[]>(yMap.size).fill([]).map(_ => Array(yMap.size)) // AS^-1XA^T

  const b_bar = [...b], c_bar = c.map(c => c - 1), z_bar = c.reduce((accu, c) => accu + c, 1)
  At.forEach(at => at.forEach(([iy, val]) => { b_bar[iy] -= val }))

  // Preallocated variables
  const dx = [...x], dy = [...y], ds = [...s], minus_xs = [...x], cent_tmp = [...x]
  const dy_1 = [...y], dy_tau = [...y], dy_theta = [...y], dx_1 = [...x], dx_tau = [...x], dx_theta = [...x]
  const bc_bar_norm = Math.sqrt(b_bar.reduce((accu, b) => accu + b * b, 0) + c_bar.reduce((accu, c) => accu + c * c, 0))

  for (let round = 0; round < 500; round++) {
    const current_centrality = centrality({ x, s, tau, kappa })
    if (current_centrality >= ((round % 2) ? 0.5 : 0.25)) throw `Bad centrality at round ${round}`

    const isPredictor = !(round % 2), tau_kappa = tau * kappa
    x.forEach((x, ix) => minus_xs[ix] = -x * s[ix])
    const mu = minus_xs.reduce((a, b) => a - b, tau_kappa) / (x.length + 1)
    // gamma * mu * e - Xs
    const cent = isPredictor ? minus_xs : (minus_xs.forEach((xs, ix) => cent_tmp[ix] = mu + xs), cent_tmp)
    const cent_tau_kappa = isPredictor ? -tau * kappa : (mu - tau * kappa)

    {
      // Exit condition
      const e1 = 1e-9 * tau * tau, e2 = 1e-9 / bc_bar_norm, e3 = 1e-9
      if (mu - tau_kappa <= e1 && theta / tau <= e2) {
        const result: Weights = {}
        yMap.forEach((val, key) => result[key] = y[val] / tau)
        return result
      }
      if (tau <= e3) throw new Error("Unbounded or Infeasible")
    }

    // These rounding errors/residuals accumulate over time,
    // so we have to nudge them back during a corrector step
    let r_prim: number[] = undefined as any, r_tau = 0
    if ((round % 32) === 31) {
      r_prim = Array<number>(y.length).fill(0)
      s.fill(0)
      kappa = 0
      At.forEach((at, ix) => at.forEach(([iy, val]) => {
        r_prim[iy] += val * x[ix]
        s[ix] -= val * y[iy]
      }))
      b.forEach((b, iy) => {
        r_prim[iy] -= b * tau
        kappa += b * y[iy]
      })
      b_bar.forEach((b, iy) => {
        r_prim[iy] += b * theta
        r_tau -= b * y[iy]
      })
      c.forEach((c, ix) => {
        s[ix] += c * tau
        kappa -= c * x[ix]
      })
      c_bar.forEach((c, ix) => {
        r_tau += c * x[ix]
        s[ix] -= c * theta
      })
      r_tau += (x.length + 1) - z_bar * tau
      kappa += z_bar * theta
    }

    asxa.forEach(arr => arr.fill(0))
    At.forEach((at, ix) => {
      const factor = x[ix] / s[ix];
      at.forEach(([iy1, val1]) => at.forEach(([iy2, val2]) => asxa[iy1][iy2] += val1 * val2 * factor))
    })

    // Write dy in terms of dtau and dtheta
    // dy = dy_1 + dy_tau * dtau + dy_theta * dtheta
    if (r_prim) r_prim.forEach((y, i) => dy_1[i] = -y); else dy_1.fill(0)
    b.forEach((b, iy) => dy_tau[iy] = b); b_bar.forEach((b, iy) => dy_theta[iy] = -b)
    At.forEach((at, ix) => at.forEach(([iy, val]) => {
      const factor = val / s[ix]
      dy_1[iy] -= factor * cent[ix]
      dy_tau[iy] += factor * x[ix] * c[ix]
      dy_theta[iy] -= factor * x[ix] * c_bar[ix]
    }))
    solveLPEq(asxa, dy_1)!.forEach((val, i) => dy_1[i] = val)
    solveLPEq(asxa, dy_tau)!.forEach((val, i) => dy_tau[i] = val)
    solveLPEq(asxa, dy_theta)!.forEach((val, i) => dy_theta[i] = val)

    // Write dx in terms of dtau and dtheta
    // dx = dx_1 + dx_tau * dtau + dx_theta * dtheta
    At.forEach((at, ix) => {
      dx_1[ix] = cent[ix]
      dx_tau[ix] = -x[ix] * c[ix]
      dx_theta[ix] = x[ix] * c_bar[ix]
      at.forEach(([iy, val]) => {
        const factor = x[ix] * val
        dx_1[ix] += factor * dy_1[iy]
        dx_tau[ix] += factor * dy_tau[iy]
        dx_theta[ix] += factor * dy_theta[iy]
      })
      const factor = s[ix]
      dx_1[ix] /= factor
      dx_tau[ix] /= factor
      dx_theta[ix] /= factor
    })

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
    const m1 = cent_tau_kappa
      + tau * dx_1.reduce((accu, dx, ix) => accu + c[ix] * dx, 0)
      - tau * dy_1.reduce((accu, dy, iy) => accu + b[iy] * dy, 0)
    const m21 = -z_bar
      + dx_tau.reduce((accu, dx, ix) => accu + c_bar[ix] * dx, 0)
      - dy_tau.reduce((accu, dy, iy) => accu + b_bar[iy] * dy, 0)
    const m22 = 0
      + dx_theta.reduce((accu, dx, ix) => accu + c_bar[ix] * dx, 0)
      - dy_theta.reduce((accu, dy, iy) => accu + b_bar[iy] * dy, 0)
    const m2 = -r_tau
      - dx_1.reduce((accu, dx, ix) => accu + c_bar[ix] * dx, 0)
      + dy_1.reduce((accu, dy, iy) => accu + b_bar[iy] * dy, 0)
    const det = m11 * m22 - m21 * m12, dtau = (m1 * m22 - m2 * m12) / det, dtheta = (m11 * m2 - m21 * m1) / det

    dx_1.forEach((d, ix) => dx[ix] = d + dx_tau[ix] * dtau + dx_theta[ix] * dtheta)
    dy_1.forEach((d, iy) => dy[iy] = d + dy_tau[iy] * dtau + dy_theta[iy] * dtheta)
    c.forEach((c, ix) => ds[ix] = c * dtau - c_bar[ix] * dtheta)
    At.forEach((at, ix) => at.forEach(([iy, val]) => ds[ix] -= dy[iy] * val))
    const dkappa = z_bar * dtheta
      - dx.reduce((accu, dx, ix) => accu + c[ix] * dx, 0)
      + dy.reduce((accu, dy, iy) => accu + b[iy] * dy, 0)

    let alpha: number
    if (isPredictor) {
      if (centrality({ x, s, tau, kappa }, { alpha: 0.75, dx, ds, dtau, dkappa }) < 0.5) {
        alpha = 0.75
      } else {
        const Pq = x.reduce((accu, x, ix) => accu + x * x * s[ix] * s[ix], tau * tau * kappa * kappa)
        // Guaranteed valid from https://www.jstor.org/stable/3690133, lemma 4
        alpha = Math.min(0.5, Math.sqrt(mu) / Math.sqrt(8 * Pq))
        // but numerical stability means we may need to nudge it a few times
        for (; alpha >= 1e-6; alpha /= 1.05)
          if (centrality({ x, s, tau, kappa }, { alpha, dx, ds, dtau, dkappa }) <= 0.5)
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

  throw new Error("LP Algorithm doesn't converge")
}

function printResidual({ x, y, At, b, c, b_bar, c_bar, s, tau, theta, kappa, z_bar }:
  {
    x: number[], y: number[], s: number[]
    At: [iy: number, val: number][][], b: number[], c: number[],
    b_bar: number[], c_bar: number[], z_bar: number,
    tau: number, theta: number, kappa: number,
  }) {
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
  console.log("Residual",
    test1.reduce((worst, x) => Math.max(worst, Math.abs(x)), -Infinity),
    test2.reduce((worst, x) => Math.max(worst, Math.abs(x)), -Infinity),
    test3, test4)
}

function centrality(val: { x: number[], s: number[], tau: number, kappa: number },
  diff?: { alpha: number, dx: number[], ds: number[], dtau: number, dkappa: number }) {
  let sum_square: number, sum: number
  if (diff) {
    const { alpha, dx, ds, dtau, dkappa } = diff, { x, s, tau, kappa } = val
    const tau_kappa = (tau + alpha * dtau) * (kappa + alpha * dkappa)
    sum = tau_kappa
    sum_square = tau_kappa * tau_kappa
    x.forEach((x, i) => {
      const xs = (x + alpha * dx[i]) * (s[i] + alpha * ds[i])
      sum += xs
      sum_square += xs * xs
    })
  } else {
    const { x, s, tau, kappa } = val
    const tau_kappa = tau * kappa
    sum = tau_kappa
    sum_square = tau_kappa * tau_kappa
    x.forEach((x, i) => {
      const xs = x * s[i]
      sum += xs
      sum_square += xs * xs
    })
  }
  const n = val.x.length + 1, mu = sum / n
  return sum_square / mu / mu - n
}

function solveLPEq(eqs: number[][], vals: number[]): number[] | undefined {
  eqs = [...eqs], vals = [...vals]

  /** j := j - (j[key]/i[key]) i , eliminating `key` from `j`. Requires `i[key] != 0` */
  function subtract(i: number, j: number, key: number) {
    const weight = eqs[j][key] / eqs[i][key]
    if (weight) {
      eqs[j] = eqs[j].map((val, index) => val - weight * eqs[i][index])
      vals[j] -= weight * vals[i]
    }
    eqs[j][key] = 0
  }
  // Gaussian Elimination
  for (let i = 0; i < vals.length; i++) {
    let bestI = i
    for (let j = i + 1; j < vals.length; j++)
      if (Math.abs(eqs[bestI][i]) < Math.abs(eqs[j][i])) bestI = j
    if (Math.abs(eqs[bestI][i]) < 1e-16) return undefined
    if (bestI !== i) {
      [eqs[bestI], eqs[i]] = [eqs[i], eqs[bestI]];
      [vals[bestI], vals[i]] = [vals[i], vals[bestI]]
    }
    for (let j = i + 1; j < vals.length; j++) subtract(i, j, i)
  }
  // eqs is now an upper triangular matrix
  for (let i = eqs.length - 1; i >= 0; i--) {
    const eqi = eqs[i]
    let sum = vals[i]
    for (let j = i + 1; j < eqi.length; j++) sum -= eqi[j] * vals[j]
    vals[i] = sum / eqi[i]
  }
  return vals
}

export const testExport = { solveLPEq }
