import { erf } from "../Util/MathUtil";

export function mvnPE_bad(mu: number[], cov: number[][], x: number[]) {
  // TODO: an implementation without using the independence assumption
  let ptot = 1
  let cptot = 1
  let upAvg = 0
  for (let i = 0; i < mu.length; ++i) {
    if (cov[i][i] < 1e-5) {
      if (mu[i] < x[i]) return { p: 0, upAvg: 0, cp: 0 }
      continue;
    }

    const z = (x[i] - mu[i]) / Math.sqrt(cov[i][i]);
    const p = (1 - erf(z / Math.sqrt(2))) / 2
    ptot *= p

    if (i == 0) {
      // Main dmg formula; compute upAvg naively
      if (z > 5) {
        const y2 = 1 / z / z
        upAvg = Math.sqrt(cov[i][i]) * (1 - 2 * y2 * (1 - y2 * (5 + 37 * y2))) / z
      }
      else {
        const phi = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI)
        upAvg = Math.sqrt(cov[i][i]) * (-z + phi / p)
      }
    }
    else {
      cptot *= p
    }
  }
  return { p: ptot, upAvg: upAvg, cp: cptot }
}
