import { Data, NumNode } from "../Formula/type"
import { precompute, optimize } from "../Formula/optimization"
import { ddx, zero_deriv } from "../Formula/differentiate"
import { ArtifactBuildData, ArtifactsBySlot, DynStat } from "../PageBuild/background"
import { SubstatKey, allSubstats, IArtifact, MainStatKey } from "../Types/artifact"
import { allSlotKeys, ArtifactSetKey, CharacterKey, SlotKey, Rarity } from '../Types/consts';
import Artifact from "../Data/Artifacts/Artifact"
import { crawlUpgrades, allUpgradeValues } from "./artifactUpgradeCrawl"
import { erf } from "../Util/MathUtil"
import { mvnPE_bad } from "./mvncdf"

type StructuredNumber = {
  v: number,
  grads: number[],
}
type GaussianMixture = {
  gmm: {
    phi: number,  // Item weight; must sum to 1.
    cp: number,   // Constraint probability
    mu: number,
    sig2: number
  }[],
  lower: number,
  upper: number,
}
export type Query = {
  formulas: NumNode[],
  curBuild: QueryBuild,

  thresholds: number[],
  evalFn: (values: Dict<string, number>) => StructuredNumber[],
  skippableDerivs: boolean[]
}
export type QueryResult = {
  id: string,
  subs: SubstatKey[],
  rollsLeft: number,
  statsBase: DynStat,
  evalFn: (values: Dict<string, number>) => StructuredNumber[],
  skippableDerivs: boolean[],

  prob: number,
  upAvg: number,
  distr: GaussianMixture,
  thresholds: number[],

  evalMode: 'fast' | 'slow',
}
export type QueryArtifact = {
  id: string,
  level: number,
  rarity: Rarity,
  slot: SlotKey,
  values: DynStat,
  subs: SubstatKey[]
}
export type QueryBuild = { [key in SlotKey]: QueryArtifact | undefined }
type InternalQuery = {
  rollsLeft: number,
  subs: SubstatKey[],
  stats: DynStat,
  thresholds: number[],
  objectiveEval: (values: Dict<string, number>) => { v: number, ks: number[] }[],
  scale: (key: SubstatKey) => number,
}
type InternalResult = {
  p: number,
  upAvg: number,
  appxDist: GaussianMixture
}


function toStats(build: QueryBuild): DynStat {
  let stats: DynStat = {}
  Object.values(build).forEach(a => {
    if (a) Object.entries(a.values).forEach(([key, value]) => stats[key] = (stats[key] ?? 0) + value)
  })
  return stats
}

// From a Gaussian mean & variance, get P(x > mu) and E[x | x > mu]
function gaussianPE(mean: number, variance: number, x: number) {
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

export function evalArtifact(objective: Query, art: QueryArtifact, slow = false): QueryResult {
  let newBuild = { ...objective.curBuild }
  newBuild[art.slot] = art
  let stats = toStats(newBuild)
  const statsBase = { ...stats }
  let scale = (key: SubstatKey) => key.endsWith('_') ? Artifact.maxSubstatValues(key, art.rarity) / 1000 : Artifact.maxSubstatValues(key, art.rarity) / 10

  const rollsLeft = Artifact.rollsRemaining(art.level, art.rarity) - (4 - art.subs.length)
  const iq: InternalQuery = {
    rollsLeft: rollsLeft,
    subs: art.subs,
    stats: stats,
    thresholds: objective.thresholds,
    scale: scale,
    objectiveEval: (stats) => objective.evalFn(stats).map(({ v, grads }) => ({ v: v, ks: art.subs.map(key => grads[allSubstats.indexOf(key)] * scale(key)) }))
  }

  // const out = slow ? gmm1d(iq) : totalGaussian1d(iq)
  const out = slow ? gmmNd(iq) : fastUB(iq);
  return {
    id: art.id,
    subs: art.subs,
    rollsLeft: rollsLeft,
    statsBase: statsBase,

    prob: out.p,
    upAvg: out.upAvg,
    distr: out.appxDist,
    evalFn: objective.evalFn,
    skippableDerivs: objective.skippableDerivs,
    thresholds: objective.thresholds,

    evalMode: slow ? 'slow' : 'fast',
  }
}

// function totalGaussian1d({ rollsLeft, subs, stats, scale, objectiveEval, thresholds }: InternalQuery, ix = 0): InternalResult {
//   // Evaluate derivatives at center of 4-D upgrade distribution
//   let stats2 = { ...stats }
//   subs.forEach(key => {
//     // console.log(key, 17 / 8 * rollsLeft * scale(key))
//     stats2[key] = (stats2[key] ?? 0) + 17 / 8 * rollsLeft * scale(key)
//   })

//   const { v, ks } = objectiveEval(stats2)[ix]
//   const ksum = ks.reduce((a, b) => a + b)
//   const ksum2 = ks.reduce((a, b) => a + b * b, 0)
//   const N = rollsLeft

//   const mean = v
//   const variance = (147 / 8 * ksum2 - 289 / 64 * ksum * ksum) * N
//   const appx: GaussianMixture = {
//     gmm: [{ phi: 1, mu: mean, sig2: variance, cp: 1 }], lower: mean - 4 * Math.sqrt(variance), upper: mean + 4 * Math.sqrt(variance)
//   }

//   return { ...gaussianPE(mean, variance, thresholds[ix]), appxDist: appx }
// }

function fastUB({ rollsLeft, subs, stats, scale, objectiveEval, thresholds }: InternalQuery): InternalResult {
  // Evaluate derivatives at center of 4-D upgrade distribution
  let stats2 = { ...stats }
  subs.forEach(key => {
    stats2[key] = (stats2[key] ?? 0) + 17 / 8 * rollsLeft * scale(key)
  })

  const N = rollsLeft
  const obj = objectiveEval(stats2);
  let p_min = 1;
  let upAvgUB = -1;
  let apxDist: GaussianMixture = { gmm: [], lower: obj[0].v, upper: obj[0].v };

  for (let ix = 0; ix < obj.length; ix++) {
    const { v, ks } = obj[ix];
    const ksum = ks.reduce((a, b) => a + b)
    const ksum2 = ks.reduce((a, b) => a + b * b, 0)

    const mean = v
    const variance = (147 / 8 * ksum2 - 289 / 64 * ksum * ksum) * N

    const { p, upAvg } = gaussianPE(mean, variance, thresholds[ix])
    if (ix == 0) {
      upAvgUB = upAvg
      apxDist = { gmm: [{ phi: 1, mu: mean, sig2: variance, cp: 1 }], lower: mean - 4 * Math.sqrt(variance), upper: mean + 4 * Math.sqrt(variance) }
    }
    p_min = Math.min(p, p_min)
  }

  return { p: p_min, upAvg: upAvgUB, appxDist: apxDist }
}

// function gmm1d({ rollsLeft, stats, subs, thresholds, scale, objectiveEval }: InternalQuery, ix = 0): InternalResult {
//   const appx: GaussianMixture = { gmm: [], lower: thresholds[0], upper: thresholds[0] }
//   let lpe: { l: number, p: number, upAvg: number }[] = []
//   crawlUpgrades(rollsLeft, (ns, p) => {
//     let stat2 = { ...stats }
//     subs.forEach((sub, i) => {
//       stat2[sub] = (stat2[sub] ?? 0) + 17 / 2 * ns[i] * scale(sub)
//     })

//     const { v, ks } = objectiveEval(stat2)[ix]
//     const mean = v
//     const variance = 5 / 4 * ks.reduce((pv, cv, i) => pv + cv * cv * ns[i], 0)
//     appx.gmm.push({ phi: p, mu: mean, sig2: variance, cp: 1 })
//     appx.lower = Math.min(appx.lower, mean - 4 * Math.sqrt(variance))
//     appx.upper = Math.max(appx.upper, mean + 4 * Math.sqrt(variance))

//     lpe.push({ l: p, ...gaussianPE(mean, variance, thresholds[ix]) })
//   })

//   // Aggregate gaussian mixture statistics.
//   let p_ret = 0, upAvg_ret = 0
//   lpe.forEach(({ l, p, upAvg }) => {
//     p_ret += l * p
//     upAvg_ret += l * p * upAvg
//   })

//   if (p_ret < 1e-10) return { p: 0, upAvg: 0, appxDist: appx }
//   upAvg_ret = upAvg_ret / p_ret
//   return { p: p_ret, upAvg: upAvg_ret, appxDist: appx }
// }

function gmmNd({ rollsLeft, stats, subs, thresholds, scale, objectiveEval }: InternalQuery): InternalResult {
  const appx: GaussianMixture = { gmm: [], lower: thresholds[0], upper: thresholds[0] }

  let lpe: { l: number, p: number, upAvg: number }[] = []
  crawlUpgrades(rollsLeft, (ns, p) => {
    let stat2 = { ...stats }
    subs.forEach((sub, i) => {
      stat2[sub] = (stat2[sub] ?? 0) + 17 / 2 * ns[i] * scale(sub)
    })

    // Loop things here
    const obj = objectiveEval(stat2);
    let mu = obj.map(o => o.v)
    let cov = obj.map(o1 => obj.map(o2 => o1.ks.reduce((pv, cv, k) => pv + o1.ks[k] * o2.ks[k] * ns[k], 0)))
    const res = mvnPE_bad(mu, cov, thresholds)
    lpe.push({ l: p, ...res })

    // Feels a little bad to discard everything but the first axis, but whatevs
    appx.gmm.push({ phi: p, mu: mu[0], sig2: cov[0][0], cp: res.cp })
    appx.lower = Math.min(appx.lower, mu[0] - 4 * Math.sqrt(cov[0][0]))
    appx.upper = Math.max(appx.upper, mu[0] + 4 * Math.sqrt(cov[0][0]))
  })

  // Aggregate gaussian mixture statistics.
  let p_ret = 0, upAvg_ret = 0
  lpe.forEach(({ l, p, upAvg }) => {
    p_ret += l * p
    upAvg_ret += l * p * upAvg
  })

  if (p_ret < 1e-10) return { p: 0, upAvg: 0, appxDist: appx }
  upAvg_ret = upAvg_ret / p_ret
  return { p: p_ret, upAvg: upAvg_ret, appxDist: appx }
}

export function querySetup(formulas: NumNode[], thresholds: number[], curBuild: QueryBuild, data: Data = {}): Query {
  let toEval: NumNode[] = []
  formulas.forEach(f => {
    toEval.push(f, ...allSubstats.map(sub => ddx(f, fo => fo.path[1], sub)))
  })
  // Opt loop a couple times to ensure all constants folded?
  let evalOpt = optimize(toEval, data, ({ path: [p] }) => p !== "dyn")
  evalOpt = optimize(evalOpt, data, ({ path: [p] }) => p !== "dyn")
  const evalFn = precompute(evalOpt, f => f.path[1])

  let stats = toStats(curBuild)
  const dmg0 = evalFn(stats)[0]

  const skippableDerivs = allSubstats.map(sub => formulas.every(f => zero_deriv(f, f => f.path[1], sub)))
  const structuredEval = (stats: Dict<string, number>) => {
    const out = evalFn(stats)
    return formulas.map((_, i) => {
      const ix = i * (1 + allSubstats.length)
      return { v: out[ix], grads: allSubstats.map((sub, si) => out[ix + 1 + si]) }
    })
  }

  return { formulas: formulas, thresholds: [dmg0, ...thresholds], curBuild: curBuild, evalFn: structuredEval, skippableDerivs: skippableDerivs }
}
