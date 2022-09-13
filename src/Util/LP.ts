import { create, lusolveDependencies } from "mathjs"

const { lusolve } = create(lusolveDependencies, {})

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
  const yKeys = [...new Set([
    ...Object.keys(objective), ...constraints.flatMap(con => Object.keys(con.weights))
  ])], yMap = new Map(yKeys.map((key, i) => [key, i]))

  // Using the same variable names as the linked paper
  const upperBounds = constraints.filter(con => con.upperBound !== undefined)
  const lowerBounds = constraints.filter(con => con.lowerBound !== undefined)
  const At = [
    ...upperBounds.map(({ weights }) => yKeys.map(key => weights[key] ?? 0)),
    ...lowerBounds.map(({ weights }) => yKeys.map(key => -(weights[key] ?? 0)))
  ], c = [
    ...upperBounds.map(con => con.upperBound!), ...lowerBounds.map(con => -con.lowerBound!)
  ], b = yKeys.map(y => objective[y] ?? 0)
  const numX = At.length, numY = yKeys.length

  /**
   * maximize b*y over y
   * s.t. At*y <= c
   *
   * using predictor-corrector method
   */
  const x = ones(numX), y = zeros(numY), s = ones(numX)
  let tau = 1, theta = 1, kappa = 1

  const minus_b_bar = b.map(b => -b), minus_c_bar = c.map(c => 1 - c), z_bar = 1 + sum(c)
  At.forEach(at => at.forEach((val, iy) => minus_b_bar[iy] += val))

  // Preallocated variables
  const dx = [...x], dy = [...y], ds = [...s], xs = [...x], centX_tmp = [...x], xInvS = [...x], minus_r_prim = zeros(numY)
  const dy_1 = [...y], dy_tau = [...y], dy_theta = [...y], dx_1 = [...x], dx_tau = [...x], dx_theta = [...x]
  const bc_bar_norm = Math.sqrt(dot(minus_b_bar, minus_b_bar) + dot(minus_c_bar, minus_c_bar))
  const eqe = zeros(numY).map(_ => zeros(numY))

  function try_create_result(): Weights | undefined {
    const ixs: number[] = [], nixs: number[] = []
    for (let ix = 0; ix < numX; ix++)
      if (x[ix] > s[ix]) ixs.push(ix)
      else nixs.push(ix)

    const numVars = ixs.length + numY + 1, iTK = numVars - 1
    const vars = zeros(numVars), d = [...vars], lambdas = [...vars], invQ = ones(numVars)
    const cb = [...y.map(y => -y), ...ixs.map(ix => -x[ix]), 0], denseBt = ixs.map(ix => At[ix])
    const constraintsT = zeros(numVars).map(_ => zeros(numVars))
    denseBt.forEach((bt, ixb) => bt.forEach((val, iy) => {
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
    {
      const factor = kappa <= tau ? vars[iTK] : 0
      for (const ix of nixs) if (c[ix] * factor < dot(At[ix], y)) return undefined // s >= 0
      for (let i = numY; i < numVars; i++) if (vars[i] < 0) return undefined // x, tau/kappa >= 0
    }
    if (kappa > tau) throw new Error("Unbounded or Infeasible")
    const tk = vars[iTK], result: Weights = {}
    yMap.forEach((iy, key) => result[key] = vars[iy] / tk)
    return result
  }

  for (let round = 0; round < 300; round++) {
    const current_centrality = centrality(x, s, tau, kappa)
    if (current_centrality >= ((round % 2) ? 0.5 : 0.25))
      throw new Error(`Bad centrality ${current_centrality} at round ${round}`)

    x.forEach((x, ix) => {
      xs[ix] = x * s[ix]
      xInvS[ix] = x / s[ix]
    })
    const isPredictor = !(round % 2), gamma = isPredictor ? 0 : 1, tau_kappa = tau * kappa
    const mu = (sum(xs) + tau_kappa) / (numX + 1)

    {
      // Exit condition
      const e1 = 1e-4, e2 = 1e-4, e3 = 1e-9
      const condition1 = mu / tau / tau, condition2 = bc_bar_norm * theta / tau
      if (!(round % 3) && condition1 <= e1 && condition2 <= e2) {
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
      for (let ix = 0; ix < numX; ix++)
        s[ix] = c[ix] * tau + minus_c_bar[ix] * theta - dot(At[ix], y)
      for (let iy = 0; iy < numY; iy++)
        minus_r_prim[iy] = b[iy] * tau + minus_b_bar[iy] * theta
      tmadd(At, x, -1, minus_r_prim)

      r_tau = (numX + 1) - z_bar * tau - dot(minus_c_bar, x) + dot(minus_b_bar, y)
      kappa = z_bar * theta - dot(c, x) + dot(b, y)
    }

    // Write dy in terms of dtau and dtheta
    // dx = dx_1 + dx_tau * dtau + dx_theta * dtheta
    // dy = dy_1 + dy_tau * dtau + dy_theta * dtheta
    const centX = !gamma ? s : (s.forEach((s, ix) => centX_tmp[ix] = s - gamma * mu / x[ix]), centX_tmp)
    try {
      solveQP(xInvS, centX, At, minus_r_prim, dx_1, dy_1, eqe, true)
      solveQP(xInvS, c, At, b, dx_tau, dy_tau, eqe, false)
      solveQP(xInvS, minus_c_bar, At, minus_b_bar, dx_theta, dy_theta, eqe, false)
      if (correctingResidual) minus_r_prim.fill(0)
    } catch {
      // When we're getting too close to the boundary, a lot of numerical instability occurs.
      // If we went off the rail too much into infeasible region, these solvers will likely fail.
      break
    }
    minus(dy_1)
    minus(dy_tau)
    minus(dy_theta)

    // [  kappa ; tau * z_bar ] * [ dtau   ] + [ -tau c^T ; tau b^T ] * [ dx - dx_1 ]
    // [ -z_bar ;     0       ]   [ dtheta ]   [  c_bar^T ; b_bar^T ]   [ dy - dy_1 ]
    //                              =
    //                  [ m11 m12 ] * [ dtau   ]
    //                  [ m21 m22 ]   [ dtheta ]
    //                              =
    // [ gamma * mu - tau * kappa ] - [ -tau c^T ; tau b^T ] * [ dx_1 ]
    // [            0             ]   [  c_bar^T ; b_bar^T ]   [ dy_1 ]
    const m11 = kappa - tau * dot(dx_tau, c) + tau * dot(dy_tau, b)
    const m12 = tau * z_bar - tau * dot(dx_theta, c) + tau * dot(dy_theta, b)
    const m1 = gamma * mu - tau_kappa + tau * dot(dx_1, c) - tau * dot(dy_1, b)
    const m21 = -z_bar - dot(dx_tau, minus_c_bar) + dot(dy_tau, minus_b_bar)
    const m22 = -dot(dx_theta, minus_c_bar) + dot(dy_theta, minus_b_bar)
    const m2 = -r_tau + dot(dx_1, minus_c_bar) - dot(dy_1, minus_b_bar)
    const det = m11 * m22 - m21 * m12, dtau = (m1 * m22 - m2 * m12) / det, dtheta = (m11 * m2 - m21 * m1) / det

    dx.fill(0); dy.fill(0); ds.fill(0)
    smadd(dx_1, 1, dx); smadd(dx_tau, dtau, dx); smadd(dx_theta, dtheta, dx)
    smadd(dy_1, 1, dy); smadd(dy_tau, dtau, dy); smadd(dy_theta, dtheta, dy)
    smadd(c, dtau, ds); smadd(minus_c_bar, dtheta, ds)
    madd(At, dy, -1, ds)
    const dkappa = z_bar * dtheta - dot(dx, c) + dot(dy, b)

    let alpha: number
    if (isPredictor) {
      if (centrality(x, s, tau, kappa, { alpha: 0.75, dx, ds, dtau, dkappa }) < 0.5) {
        alpha = 0.75
      } else {
        const Pq = dot(xs, xs) + tau_kappa * tau_kappa
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
    smadd(dx, alpha, x)
    smadd(dy, alpha, y)
    smadd(ds, alpha, s)
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
  At: number[][], b: number[], c: number[],
  minus_b_bar: number[], minus_c_bar: number[], z_bar: number,
  tau: number, theta: number, kappa: number) {
  const test1 = zeros(y.length), test2 = zeros(x.length)
  At.forEach((at, ix) => at.forEach((val, iy) => {
    test1[iy] += val * x[ix]
    test2[ix] -= val * y[iy]
  }))
  smadd(b, -tau, test1)
  smadd(minus_b_bar, -theta, test1)
  smadd(c, tau, test2)
  smadd(minus_c_bar, theta, test2)
  smadd(s, -1, test2)
  const test3 = dot(b, y) - dot(c, x) + z_bar * theta - kappa
  const test4 = dot(minus_b_bar, y) - dot(minus_c_bar, x) + (x.length + 1) - z_bar * tau
  console.log("Residual", round,
    Math.max(...test1.map(Math.abs)),
    Math.max(...test2.map(Math.abs)),
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
    if (!eqe) eqe = zeros(numL).map(_ => Array(numL))
    eqe.forEach(row => row.fill(0))
    Et.forEach((col, ix) =>
      col.forEach((e, il1) => {
        for (let il2 = il1; il2 < numL; il2++)
          eqe![il1][il2] += invQ[ix] * e * col[il2]
      }))
    for (let il1 = 0; il1 < numL; il1++)
      for (let il2 = il1 + 1; il2 < numL; il2++)
        eqe[il2][il1] = eqe[il1][il2]
    for (let il = 0; il < numL; il++)
      eqe[il][il] += 1e-12 // Preconditioning
  }
  // -(E invQ E^T)lambda = d + E invQ c
  d.forEach((d, il) => lambda[il] = -d)
  Et.forEach((col, ix) => col.forEach((e, il) => lambda[il] -= e * invQ[ix] * c[ix]))
  const newLambda = lusolve(eqe, lambda) as number[]
  newLambda.forEach((v, i) => lambda[i] = v)

  // x = -invQ (c + E^t lambda)
  Et.forEach((col, ix) => x[ix] = -invQ[ix] * (c[ix] + dot(col, lambda)))
}

function ones(len: number) {
  return Array<number>(len).fill(1)
}
function zeros(len: number) {
  return Array<number>(len).fill(0)
}
/** out[i] += a[i] * b */
function smadd(a: number[], b: number, out: number[]) {
  a.forEach((a, i) => out[i] += a * b)
}
/** out[i] += A[i][j] * b[j] * c */
function madd(A: number[][], b: number[], c: number, out: number[]) {
  A.forEach((row, i) => row.forEach((a, j) => out[i] += a * b[j] * c))
}
/** out[j] += b[i] * A[i][j] * c */
function tmadd(A: number[][], b: number[], c: number, out: number[]) {
  A.forEach((row, i) => row.forEach((a, j) => out[j] += a * b[i] * c))
}
function minus(a: number[]) {
  a.forEach((a, i, array) => array[i] = -a)
  return a
}
function sum(a: number[]) {
  return a.reduce((accu, a) => accu + a, 0)
}
function dot(a: number[], b: number[]): number {
  return a.reduce((accu, a, i) => accu + a * b[i], 0)
}

export const testExport = { solveQP }
