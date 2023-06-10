import { erf } from './mathUtil'
// import { Module } from "wasmpack/assembly.js";

// From a Gaussian mean & variance, get P(x > mu) and E[x | x > mu]
export function gaussianPE(
  mean: number,
  variance: number,
  x: number
): { p: number; upAvg: number } {
  if (variance < 1e-5) {
    if (mean > x) return { p: 1, upAvg: mean - x }
    return { p: 0, upAvg: 0 }
  }

  const z = (x - mean) / Math.sqrt(variance)
  const p = (1 - erf(z / Math.sqrt(2))) / 2
  if (z > 5) {
    // Z-score large means p will be very small.
    // We can use taylor expansion at infinity to evaluate upAvg.
    const y = 1 / z,
      y2 = y * y
    return {
      p: p,
      upAvg: Math.sqrt(variance) * y * (1 - 2 * y2 * (1 - y2 * (5 + 37 * y2))),
    }
  }

  const phi = Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)
  return { p: p, upAvg: mean - x + (Math.sqrt(variance) * phi) / p }
}

// From a multivariate Gaussian mean & variance, get P(x > mu) and E[x0 | x > mu]
export function mvnPE_bad(mu: number[], cov: number[][], x: number[]) {
  // TODO: an implementation without using the independence assumption
  let ptot = 1
  let cptot = 1
  for (let i = 0; i < mu.length; ++i) {
    if (cov[i][i] < 1e-5) {
      if (mu[i] < x[i]) return { p: 0, upAvg: 0, cp: 0 }
      continue
    }

    const z = (x[i] - mu[i]) / Math.sqrt(cov[i][i])
    const p = (1 - erf(z / Math.sqrt(2))) / 2
    ptot *= p

    if (i !== 0) cptot *= p
  }

  // Naive 1st moment of truncated distribution: assume it's relatively stationary w.r.t. the
  //  constraints. If the constraints greatly affects the moment, then its associated
  //  conditional probability should also be small. Therefore in conjunction with the summation
  //  method in `gmmNd()`, the overall approximation should be fairly good, even if the individual
  //  upAvg terms may be very bad.
  // Appears to work well in practice.
  //
  // More rigorous methods for estimating 1st moment of truncated multivariate distribution exist.
  // https://www.cesarerobotti.com/wp-content/uploads/2019/04/JCGS-KR.pdf
  const { upAvg } = gaussianPE(mu[0], cov[0][0], x[0])
  return { p: ptot, upAvg: upAvg, cp: cptot }
}

// export function mvnPE_good(mu: number[], cov: number[][], x: number[]) {
//   let mvn: any = new Module.MVNHandle(mu.length);
//   try {
//     x.forEach(xi => mvn.pushX(xi));
//     mu.forEach(mui => mvn.pushMu(mui));
//     cov.forEach(arr => arr.forEach(c => mvn.pushCov(c)));

//     mvn.compute()
//     return { p: mvn.p, upAvg: mvn.Eup, cp: mvn.cp }
//   }
//   finally {
//     mvn.delete();
//   }
// }
