import { erf, gaussPDF } from './mathUtil'
// import { Module } from "wasmpack/assembly.js";

/**
 * mvncdf stands for Multivariate Normal Cumulative Distributive Function. File
 * name as such due to convention from the MATLAB/scipy/FORTRAN implementations.
 */

/** From a 1D Gaussian mean & variance, get P(x > mu) and E[x | x > mu] */
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
  const phi = gaussPDF(z)

  const y2 = 1 / (z * z)
  // When z is small, p and phi are both nonzero so (phi/p - z) is ok.
  // When p and phi are both small, we can take use the Taylor expansion
  //  of (phi/p - z) at z=inf (or if y=1/z, at y=0). Using 7th order expansion to ensure
  //  upAvg is continuous at z=5.
  const ppz = z < 5 ? phi / p - z : (1 - 2 * y2 * (1 - y2 * (5 + 37 * y2))) / z
  return { p, upAvg: Math.sqrt(variance) * ppz }
}

/**
 * From a multivariate Gaussian mean & covariance, get P(x > mu) and E[x0 | x > mu]
 * Javascript implementation ignores the cov off-diagonals (assumes all components are independent).
 */
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

  const { upAvg } = gaussianPE(mu[0], cov[0][0], x[0])
  return { p: ptot, upAvg: upAvg, cp: cptot }
}

/**
 * From a multivariate Gaussian mean & covariance, get P(x > mu) and E[x0 | x > mu]
 * This is implemented in Fortran, but it does take into account the off-diagonals.
 *
 * TODO: re-implement the WebAssembly bridge.
 */
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
