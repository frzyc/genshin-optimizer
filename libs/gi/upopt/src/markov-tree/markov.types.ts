import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import type { DynStat } from '@genshin-optimizer/gi/solver'

export type GaussianNode = {
  base: DynStat
  subs: SubstatKey[]
  mu: number[] // Mean stats vector
  cov: number[][] // Covariance of stats matrix
}

export type EvaluatedGaussian = {
  f_mu: readonly number[] // f(mu)
  f_cov: readonly number[][] // Covariance of f(X)
  prob: number // P[X >= x]
  constr_prob: number // P[X[1:] >= x[1:]]
  upAvg: number // E[X[0] | X >= x]

  // Left & right bounds for visualization
  lower: number
  upper: number
}

export type Objective = {
  computeWithDerivs: (x: DynStat) => [number[], DynStat[]]
  threshold: number[]
  zeroDeriv: SubstatKey[] // Substats that have zero derivative for all objective functions.
}
