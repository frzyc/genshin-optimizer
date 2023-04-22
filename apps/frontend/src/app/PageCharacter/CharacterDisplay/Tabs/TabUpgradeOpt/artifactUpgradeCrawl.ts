import type { SubstatKey } from '../../../../Types/artifact'
import type { QueryResult } from './artifactQuery'
import Artifact from '../../../../Data/Artifacts/Artifact'
import { allSubstatKeys } from '../../../../Types/artifact'
import { range, cartesian } from '../../../../Util/Util'
import { quadrinomial } from './mathUtil'

// Manually cached multinomial distribution.
// Example: sigma([2, 3, 0, 0], 5)
//   gives the probability (n1=2, n2=3, n3=0, n4=0) given N=5 total rolls. (uniform distribution is assumed for the four bins)
// `sigr` and `sig_arr` constitute a near perfect hash of all combinations for N=1 to N=5.
// This function has undefined behavior for N > 5 and N = 0
// prettier-ignore
const sig_arr = [270 / 1024, 80 / 1024, 0, 12 / 256, 8 / 256, 120 / 1024, 0, 60 / 1024, 4 / 256, 60 / 1024, 4 / 256, 30 / 1024, 24 / 256, 160 / 1024, 1 / 64, 1 / 64, 24 / 256, 1 / 64, 12 / 256, 0, 6 / 256, 2 / 16, 6 / 256, 0, 81 / 256, 16 / 256, 0, 27 / 64, 12 / 64, 0, 1 / 16, 1 / 16, 12 / 64, 1 / 16, 6 / 64, 3 / 4, 2 / 4, 243 / 1024, 32 / 1024, 0, 108 / 256, 32 / 256, 0, 9 / 64, 6 / 64, 48 / 256, 0, 24 / 256, 3 / 64, 5 / 1024, 3 / 64, 5 / 1024, 0, 405 / 1024, 80 / 1024, 0, 54 / 256, 90 / 1024, 40 / 1024, 0, 1 / 256, 1 / 256, 40 / 1024, 1 / 256, 20 / 1024, 9 / 16, 4 / 16, 0, 1 / 4, 1 / 4, 0, 1 / 4, 27 / 64, 8 / 64, 0, 6 / 16, 4 / 16, 10 / 1024, 0, 10 / 1024, 2 / 16, 0, 0, 0, 15 / 1024, 10 / 1024, 1 / 1024, 1 / 1024, 0, 1 / 1024]
const sigr = [35, 64, 70, 21, 33, 45, 12, 0, 53, 76, 48, 86]
function sigma(ss: number[], N: number) {
  const ssum = ss.reduce((a, b) => a + b)
  if (ss.length > 4 || ssum > N) return 0
  if (ss.length === 4 && ssum !== N) return 0
  if (ss.length === 3) ss = [...ss, N - ssum]
  ss.sort().reverse()

  // t = 12
  // offset = -14
  let v = 13 * N + ss.length - 14 + 16 * ss[0]
  if (ss.length > 1) v += 4 * ss[1]
  const x = v % 12
  const y = Math.trunc(v / 12) // integer divide

  return sig_arr[x + sigr[y]]
}

export function crawlUpgrades(
  n: number,
  fn: (n1234: number[], p: number) => void
) {
  if (n === 0) {
    fn([0, 0, 0, 0], 1)
    return
  }

  // Binomial(n+3, 3) branches to crawl.
  for (let i1 = n; i1 >= 0; i1--) {
    for (let i2 = n - i1; i2 >= 0; i2--) {
      for (let i3 = n - i1 - i2; i3 >= 0; i3--) {
        const i4 = n - i1 - i2 - i3
        const p_comb = sigma([i1, i2, i3, i4], n)
        fn([i1, i2, i3, i4], p_comb)
      }
    }
  }
}

export function allUpgradeValues({
  statsBase,
  rollsLeft,
  subs,
  skippableDerivs,
  fourthsubOpts,
  evalFn,
}: QueryResult) {
  // TODO: Include non-5* artifacts
  const scale = (key: SubstatKey) =>
    key.endsWith('_')
      ? Artifact.substatValue(key, 5) / 1000
      : Artifact.substatValue(key, 5) / 10
  const base = statsBase

  const results: WeightedPoint[] = []
  crawlUpgrades(rollsLeft, (ns, p) => {
    if (fourthsubOpts) ns[3] += 1
    const vals = ns.map((ni, i) => {
      if (fourthsubOpts && i === 3) return range(7 * ni, 10 * ni)
      const sub = subs[i]
      if (sub && !skippableDerivs[allSubstatKeys.indexOf(sub)])
        return range(7 * ni, 10 * ni)
      return [NaN]
    })

    const allValues: number[][] = cartesian(...vals)
    allValues.forEach((upVals) => {
      const stats = { ...base }
      let p_upVals = 1
      for (let i = 0; i < 3; i++) {
        if (isNaN(upVals[i])) continue

        const key = subs[i]
        const val = upVals[i]
        const ni = ns[i]
        stats[key] = (stats[key] ?? 0) + val * scale(key)
        const p_val = 4 ** -ni * quadrinomial(ni, val - 7 * ni)
        p_upVals *= p_val
      }
      if (fourthsubOpts !== undefined) {
        fourthsubOpts.forEach(({ sub, subprob }) => {
          const stats2 = { ...stats }
          const key = sub
          const val = upVals[3]
          const ni = ns[3]
          stats2[key] = (stats2[key] ?? 0) + val * scale(key)
          const p_val = 4 ** -ni * quadrinomial(ni, val - 7 * ni) * subprob
          const p_upVals2 = p_upVals * p_val
          results.push({ v: evalFn(stats2).map((n) => n.v), p: p * p_upVals2 })
        })
        return
      }
      if (!isNaN(upVals[3])) {
        const key = subs[3]
        const val = upVals[3]
        const ni = ns[3]
        stats[key] = (stats[key] ?? 0) + val * scale(key)
        const p_val = 4 ** -ni * quadrinomial(ni, val - 7 * ni)
        p_upVals *= p_val
      }
      results.push({ v: evalFn(stats).map((n) => n.v), p: p * p_upVals })
    })
  })

  return results
}

type WeightedPoint = {
  v: number[]
  p: number
}
