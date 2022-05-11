import { QueryArtifact, QueryResult } from "./artifactQuery"
import { SubstatKey, allSubstats, IArtifact, MainStatKey } from "../Types/artifact"
import Artifact from "../Data/Artifacts/Artifact"
import { range } from "../Util/Util"
import { quadrinomial } from "../Util/MathUtil"

// Cartesian product of arrays
const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

const sig_arr = [270 / 1024, 80 / 1024, 0, 12 / 256, 8 / 256, 120 / 1024, 0, 60 / 1024, 4 / 256, 60 / 1024, 4 / 256, 30 / 1024, 24 / 256, 160 / 1024, 1 / 64, 1 / 64, 24 / 256, 1 / 64, 12 / 256, 0, 6 / 256, 2 / 16, 6 / 256, 0, 81 / 256, 16 / 256, 0, 27 / 64, 12 / 64, 0, 1 / 16, 1 / 16, 12 / 64, 1 / 16, 6 / 64, 3 / 4, 2 / 4, 243 / 1024, 32 / 1024, 0, 108 / 256, 32 / 256, 0, 9 / 64, 6 / 64, 48 / 256, 0, 24 / 256, 3 / 64, 5 / 1024, 3 / 64, 5 / 1024, 0, 405 / 1024, 80 / 1024, 0, 54 / 256, 90 / 1024, 40 / 1024, 0, 1 / 256, 1 / 256, 40 / 1024, 1 / 256, 20 / 1024, 9 / 16, 4 / 16, 0, 1 / 4, 1 / 4, 0, 1 / 4, 27 / 64, 8 / 64, 0, 6 / 16, 4 / 16, 10 / 1024, 0, 10 / 1024, 2 / 16, 0, 0, 0, 15 / 1024, 10 / 1024, 1 / 1024, 1 / 1024, 0, 1 / 1024]
const sigr = [35, 64, 70, 21, 33, 45, 12, 0, 53, 76, 48, 86]
function sigma(ss: number[], n: number) {
  const ssum = ss.reduce((a, b) => a + b);
  if ((ss.length > 4) || ssum > n) return 0
  if ((ss.length == 4) && (ssum != n)) return 0
  if (ss.length == 3) ss = [...ss, n - ssum]
  ss.sort().reverse();

  // t = 12
  // offset = -14
  let v = 13 * n + ss.length - 14 + 16 * ss[0]
  if (ss.length > 1) v += 4 * ss[1]
  const x = v % 12
  const y = Math.trunc(v / 12) // integer divide

  return sig_arr[x + sigr[y]]
}

export function crawlUpgrades(n: number, fn?: (n1234: number[], p: number) => void) {
  if (n == 0) {
    fn!([0, 0, 0, 0], 1)
    return
  }

  // Binomial(n+3, 3) branches to crawl.
  for (let i1 = n; i1 >= 0; i1--) {
    for (let i2 = n - i1; i2 >= 0; i2--) {
      for (let i3 = n - i1 - i2; i3 >= 0; i3--) {
        const i4 = n - i1 - i2 - i3;
        const p_comb = sigma([i1, i2, i3, i4], n)
        fn!([i1, i2, i3, i4], p_comb)
      }
    }
  }
}

export function allUpgradeValues(upOpt: QueryResult) {
  // TODO: Fixed rarity 5*
  let scale = (key: SubstatKey) => key.endsWith('_') ? Artifact.maxSubstatValues(key, 5) / 1000 : Artifact.maxSubstatValues(key, 5) / 10

  const base = upOpt.statsBase
  const f = upOpt.evalFn

  let results: WeightedPoint[] = []
  crawlUpgrades(upOpt.rollsLeft, (ns, p) => {
    const vals = ns.map((ni, i) => {
      const sub = upOpt.subs[i]
      if (sub && !upOpt.skippableDerivs[allSubstats.indexOf(sub)]) return range(7 * ni, 10 * ni)
      return [NaN]
    })

    // Cartesian product
    const allValues: number[][] = cartesian(...vals)
    allValues.forEach(upVals => {
      let stats = { ...base }
      let p_upVals = 1
      for (let i = 0; i < 4; i++) {
        if (isNaN(upVals[i])) continue

        const key = upOpt.subs[i];
        const val = upVals[i];
        const ni = ns[i];
        stats[key] = (stats[key] ?? 0) + val * scale(key)
        let p_val = (4 ** -ni) * quadrinomial(ni, val - 7 * ni)
        p_upVals *= p_val
      }
      results.push({ v: f(stats).map(n => n.v), p: p * p_upVals })
    })
  })

  return results
}

type WeightedPoint = {
  v: number[],
  p: number
}
