import { erf } from "../Util/MathUtil";
import { Module } from "wasmpack/assembly.js";

const ZEROCOV = 1e-5

// From a Gaussian mean & variance, get P(x > mu) and E[x | x > mu]
export function gaussianPE(mean: number, variance: number, x: number) {
  if (variance < ZEROCOV) {
    if (mean > x) return { p: 1, upAvg: mean - x }
    return { p: 0, upAvg: 0 }
  }

  const z = (x - mean) / Math.sqrt(variance)
  const p = (1 - erf(z / Math.sqrt(2))) / 2
  if (z > 5) {
    // Z-score large means p will be very small.
    // We can use taylor expansion at infinity to evaluate upAvg.
    const y = 1 / z, y2 = y * y
    return { p: p, upAvg: Math.sqrt(variance) * y * (1 - 2 * y2 * (1 - y2 * (5 + 37 * y2))) }
  }

  const phi = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI)
  return { p: p, upAvg: mean - x + Math.sqrt(variance) * phi / p }
}

// From a multivariate Gaussian mean & variance, get P(x > mu) and E[x0 | x > mu]
export function mvnPE_bad(mu: number[], cov: number[][], x: number[]) {
  // TODO: an implementation without using the independence assumption
  let ptot = 1
  let cptot = 1
  for (let i = 0; i < mu.length; ++i) {
    if (cov[i][i] < ZEROCOV) {
      if (mu[i] < x[i]) return { p: 0, upAvg: 0, cp: 0 }
      continue;
    }

    const z = (x[i] - mu[i]) / Math.sqrt(cov[i][i]);
    const p = (1 - erf(z / Math.sqrt(2))) / 2
    ptot *= p

    if (i != 0) cptot *= p
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

export function mvnPE_good(mu: number[], cov: number[][], x: number[]) {
  let keepIxs = [0]
  for (let i = 1; i < mu.length; i++) {
    if (cov[i][i] < ZEROCOV) {
      if (mu[i] < x[i]) return { p: 0, upAvg: 0, cp: 0 }
      continue;
    }

    keepIxs.push(i)
  }
  if (cov[0][0] < ZEROCOV) {
    if (mu[0] < x[0]) return { p: 0, upAvg: 0, cp: 1 }
    return { p: 1, cp: 1, upAvg: mu[0] - x[0] }
  }

  let mvn: any = new Module.MVNHandle(keepIxs.length);
  try {
    let sendx: number[] = []
    let sendm: number[] = []
    let sendc: number[] = []
    keepIxs.forEach(i => {
      mvn.pushX(x[i])
      mvn.pushMu(mu[i])
      keepIxs.forEach(j => mvn.pushCov(cov[i][j]))

      sendx.push(x[i])
      sendm.push(mu[i])
      keepIxs.forEach(j => sendc.push(cov[i][j]))
    })

    // console.log('SENDING', sendx, sendm, sendc)

    mvn.compute()
    // console.log(x, mu, cov, { p: mvn.p, upAvg: mvn.Eup, cp: mvn.cp })
    if (!isFinite(mvn.Eup)) {
      // console.log(mvn.Eup, mvn.p, mvn.cp, cov)
      // console.log(keepIxs)
    }
    return { p: mvn.p, upAvg: mvn.Eup, cp: mvn.cp }
  }
  finally {
    // HAHAHA explicit memory management in my javascript
    mvn.delete();
  }
}


export function debugMVN() {
  var mvn = new Module.MVNHandle(1);
  mvn.pushX(0);
  mvn.pushMu(0);
  mvn.pushCov(1);

  mvn.compute();
  console.log('this', mvn.p)
  mvn.delete()

  var mvn2 = new Module.MVNHandle(2);
  let mu = [1, 0]
  let x = [1.2, 1]
  let cov = [[10, -5], [-5, 20]]
  mu.forEach(m => mvn2.pushMu(m))
  x.forEach(x => mvn2.pushX(x))
  cov.forEach(a => a.forEach(c => mvn2.pushCov(c)))
  mvn2.compute()
  console.log('that', mvn2.p)
  console.log('cp', mvn2.cp)
  console.log('eup', mvn2.Eup)
  mvn2.delete()

  var mvn3 = new Module.MVNHandle(2);
  mu = [0, 0]
  x = [0, 0]
  cov = [[1, 1], [1, 1]]
  mu.forEach(m => mvn3.pushMu(m))
  x.forEach(x => mvn3.pushX(x))
  cov.forEach(a => a.forEach(c => mvn3.pushCov(c)))
  mvn3.compute()
  console.log('that', mvn3.p)
  console.log('cp', mvn3.cp)
  console.log('eup', mvn3.Eup)
  mvn3.delete()
}
