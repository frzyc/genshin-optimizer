import { erf } from "../../../../Util/MathUtil";
import { Module } from "wasmpack/assembly.js";

// From a Gaussian mean & variance, get P(x > mu) and E[x | x > mu]
export function gaussianPE(mean: number, variance: number, x: number) {
  if (variance < 1e-5) {
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
    if (cov[i][i] < 1e-5) {
      if (mu[i] < x[i]) return { p: 0, upAvg: 0, cp: 0 }
      continue;
    }

    const z = (x[i] - mu[i]) / Math.sqrt(cov[i][i]);
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

export function mvnPE_good(mu: number[], cov: number[][], x: number[]) {
  let mvn: any = new Module.MVNHandle(mu.length);
  try {
    x.forEach(xi => mvn.pushX(xi));
    mu.forEach(mui => mvn.pushMu(mui));
    cov.forEach(arr => arr.forEach(c => mvn.pushCov(c)));

    mvn.compute()
    return { p: mvn.p, upAvg: mvn.Eup, cp: mvn.cp }
  }
  finally {
    // HAHAHA explicit memory management in my javascript
    mvn.delete();
  }
}


export function debugMVN() {
  console.log('FROM debugMVN()')
  // var mvn = new Module.MVNHandle(1);
  // mvn.pushX(0);
  // mvn.pushMu(0);
  // mvn.pushCov(1);

  // mvn.compute();
  // console.log('this', mvn.p)
  // mvn.delete()

  // var mvn2 = new Module.MVNHandle(2);
  // let mu = [0, 0]
  // let x = [1, 1]
  // let cov = [[10, -5], [-5, 20]]
  // mu.forEach(m => mvn2.pushMu(m))
  // x.forEach(x => mvn2.pushX(x))
  // cov.forEach(a => a.forEach(c => mvn2.pushCov(c)))
  // mvn2.compute()
  // console.log('that', mvn2.p)
  // console.log('cp', mvn2.cp)
  // console.log('eup', mvn2.Eup)
  // mvn2.delete()

  // var mvn3 = new Module.MVNHandle(4);
  // let mu3 = [0.30650569, 0.53707501, 0.95858678, 0.80295683]
  // let x3 = [0, 0, 0, 0]
  // let cov3 = [
  //   [0.48907391, 0.02377247, -0.16140441, -0.24788451],
  //   [0.02377247, 0.40132075, -0.19141678, 0.09189226],
  //   [-0.16140441, -0.19141678, 0.41230111, -0.03428392],
  //   [-0.24788451, 0.09189226, -0.03428392, 0.16998822]
  // ]
  // mu3.forEach(m => mvn3.pushMu(m))
  // x3.forEach(x => mvn3.pushX(x))
  // cov3.forEach(a => a.forEach(c => mvn3.pushCov(c)))

  // mvn3.compute()
  // console.log('mvn3', mvn3.p, mvn3.cp, mvn3.Eup)

  var mvn4 = new Module.MVNHandle(2);
  let mu4 = [29437.599765014198, 2597.693806908243]
  let x4 = [31777.245955648243, 30]
  let cov4 = [[3025.039702728439, 266.94183507340136], [266.94183507340136, 23.556035726765433]]
  mu4.forEach(m => mvn4.pushMu(m))
  x4.forEach(x => mvn4.pushX(x))
  cov4.forEach(a => a.forEach(c => mvn4.pushCov(c)))
  mvn4.compute()
  console.log('mvn4', mvn4.p, mvn4.cp, mvn4.Eup)
}
