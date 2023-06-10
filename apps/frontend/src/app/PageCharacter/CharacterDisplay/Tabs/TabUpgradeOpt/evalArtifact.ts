import type { SubstatKey } from '../../../../Types/artifact'
import { allSubstatKeys } from '../../../../Types/artifact'
import { allArtifactSetKeys } from '@genshin-optimizer/consts'
import Artifact from '../../../../Data/Artifacts/Artifact'
import type { DynStat } from '../../../../Solver/common'
import type {
  GaussianMixture,
  Query,
  QueryArtifact,
  QueryBuild,
  QueryResult,
} from './artifactQuery'
import { crawlUpgrades } from './artifactUpgradeCrawl'
import { gaussianPE, mvnPE_bad as mvnPE } from './mvncdf'

type InternalQuery = {
  rollsLeft: number
  subs: SubstatKey[]
  calc4th: boolean
  stats: DynStat
  thresholds: number[]
  objectiveEval: (values: DynStat) => { v: number; ks: number[] }[]
  scale: (key: SubstatKey) => number
}
type InternalResult = {
  prob: number
  upAvg: number
  distr: GaussianMixture
}

function toStats(build: QueryBuild): DynStat {
  const stats: DynStat = {}
  Object.values(build).forEach((a) => {
    if (a)
      Object.entries(a.values).forEach(
        ([key, value]) => (stats[key] = (stats[key] ?? 0) + value)
      )
  })
  return stats
}
const fWeight: StrictDict<SubstatKey, number> = {
  hp: 6,
  atk: 6,
  def: 6,
  hp_: 4,
  atk_: 4,
  def_: 4,
  eleMas: 4,
  enerRech_: 4,
  critRate_: 3,
  critDMG_: 3,
}
const fWeightTot = Object.values(fWeight).reduce((a, b) => a + b)
function subProb(sub: SubstatKey, excluded: SubstatKey[]) {
  if (excluded.includes(sub)) return 0
  const denom = fWeightTot - excluded.reduce((a, b) => a + (fWeight[b] ?? 0), 0)
  return fWeight[sub] / denom
}

export function evalArtifact(
  objective: Query,
  art: QueryArtifact,
  slow = false,
  calc4th = false
): QueryResult {
  const newBuild = { ...objective.curBuild }
  newBuild[art.slot] = art
  const newStats = toStats(newBuild)
  const statsBase = { ...newStats }
  const scale = (key: SubstatKey) =>
    key.endsWith('_')
      ? Artifact.substatValue(key, art.rarity) / 1000
      : Artifact.substatValue(key, art.rarity) / 10

  const rollsLeft =
    Artifact.rollsRemaining(art.level, art.rarity) - (4 - art.subs.length)
  if (art.subs.length === 4) calc4th = false

  if (!calc4th) {
    const iq: InternalQuery = {
      rollsLeft,
      subs: art.subs,
      calc4th,
      stats: newStats,
      thresholds: objective.thresholds,
      objectiveEval: (stats) =>
        objective.evalFn(stats).map(({ v, grads }) => ({
          v: v,
          ks: art.subs.map(
            (key) => grads[allSubstatKeys.indexOf(key)] * scale(key)
          ),
        })),
      scale,
    }

    const out = slow ? slowGMMnd(iq) : fastGaussian(iq)
    return {
      id: art.id,
      subs: art.subs,
      rollsLeft: rollsLeft,
      statsBase: statsBase,

      ...out,
      evalFn: objective.evalFn,
      skippableDerivs: objective.skippableDerivs,
      thresholds: objective.thresholds,

      evalMode: slow ? 'slow' : 'fast',
    }
  } else {
    const msOption = Object.keys(art.values)
      .filter((v) => !(art.subs as string[]).includes(v))
      .filter((v) => !(allArtifactSetKeys as readonly string[]).includes(v))
    if (msOption.length !== 1)
      throw Error('Failed to extract artifact main stat')
    const mainStat = msOption[0]

    const subsToConsider = allSubstatKeys.filter(
      (s) => !art.subs.includes(s) && s !== mainStat
    )
    const results = subsToConsider.map((nxtsub) => {
      const subs = [...art.subs, nxtsub]
      const iq: InternalQuery = {
        rollsLeft,
        subs,
        calc4th,
        stats: newStats,
        thresholds: objective.thresholds,
        objectiveEval: (stats) =>
          objective.evalFn(stats).map(({ v, grads }) => ({
            v,
            ks: subs.map(
              (key) => grads[allSubstatKeys.indexOf(key)] * scale(key)
            ),
          })),
        scale,
      }

      const out = slow ? slowGMMnd(iq) : fastGaussian(iq)
      return {
        ...out,
        p2: subProb(nxtsub, [...art.subs, mainStat as SubstatKey]),
      }
    })

    const ptot = results.reduce((a, { prob: p, p2 }) => a + p * p2, 0)
    const upAvgtot =
      ptot < 1e-6
        ? 0
        : results.reduce((a, { prob: p, p2, upAvg }) => a + p * p2 * upAvg, 0) /
          ptot
    const distrtot = results.reduce(
      (dtot, { p2, distr }) => {
        dtot.lower = Math.min(dtot.lower, distr.lower)
        dtot.upper = Math.max(dtot.upper, distr.upper)
        dtot.gmm.push(
          ...distr.gmm.map(({ phi, cp, mu, sig2 }) => ({
            phi: p2 * phi,
            cp,
            mu,
            sig2,
          }))
        )
        return dtot
      },
      { gmm: [], lower: Infinity, upper: -Infinity } as GaussianMixture
    )

    return {
      id: art.id,
      subs: art.subs,
      fourthsubOpts: subsToConsider.map((sub) => ({
        sub,
        subprob: subProb(sub, [...art.subs, mainStat as SubstatKey]),
      })),
      rollsLeft: rollsLeft,
      statsBase: statsBase,

      prob: ptot,
      upAvg: upAvgtot,
      distr: distrtot,
      evalFn: objective.evalFn,
      skippableDerivs: objective.skippableDerivs,
      thresholds: objective.thresholds,

      evalMode: slow ? 'slow' : 'fast',
    }
  }
}

// Estimates an upper bound for summary statistics by approximating each formula/constraint indepenently,
//   then taking a min() over all the formulas. The approximations use derivatives to construct a linear
//   approximation of the damage formula, which we can use to treat the substats as a weighted sum of random
//   variables. Then do some math to get the expected mean & variance of the weighted sum and approximate
//   the distribution with a Gaussian.
function fastGaussian({
  rollsLeft,
  subs,
  stats,
  thresholds,
  calc4th,
  scale,
  objectiveEval,
}: InternalQuery): InternalResult {
  // Evaluate derivatives at center of 4-D upgrade distribution
  const stats2 = { ...stats }
  subs.forEach((subKey, i) => {
    const b = calc4th && i === 3 ? 1 : 0
    stats2[subKey] =
      (stats2[subKey] ?? 0) + (17 / 2) * (rollsLeft / 4 + b) * scale(subKey)
  })

  const N = rollsLeft
  const obj = objectiveEval(stats2)
  let p_min = 1
  let upAvgUB = -1
  let apxDist: GaussianMixture = { gmm: [], lower: obj[0].v, upper: obj[0].v }

  // Iterate over objectives, aggregate by min() to construct an upper bound.
  for (let ix = 0; ix < obj.length; ix++) {
    const { v, ks } = obj[ix]
    const ksum = ks.reduce((a, b) => a + b)
    const ksum2 = ks.reduce((a, b) => a + b * b, 0)

    const mean = v
    const variance =
      ((147 / 8) * ksum2 - (289 / 64) * ksum * ksum) * N +
      (calc4th ? (5 / 4) * ks[3] * ks[3] : 0)

    const { p, upAvg } = gaussianPE(mean, variance, thresholds[ix])
    if (ix === 0) {
      upAvgUB = upAvg
      apxDist = {
        gmm: [{ phi: 1, mu: mean, sig2: variance, cp: 1 }],
        lower: mean - 4 * Math.sqrt(variance),
        upper: mean + 4 * Math.sqrt(variance),
      }
    }
    p_min = Math.min(p, p_min)
  }

  return { prob: p_min, upAvg: upAvgUB, distr: apxDist }
}

// Accurately estimates the summary statistics by approximating each formula/constraint on the scale of a
//   single roll, and iterating across all combinations of roll outcomes. This approximation works much better
//   because the linear approximation is more valid on the smaller region. Also the substat upgrade values
//   are conditionally independent given the number of rolls in each, giving much better justification for the
//   Gaussian approximation.
// The splits across roll combinations means `gmmNd` gives an N-dimensional Gaussian mixture model.
function slowGMMnd({
  rollsLeft,
  stats,
  subs,
  thresholds,
  calc4th,
  scale,
  objectiveEval,
}: InternalQuery): InternalResult {
  const appx: GaussianMixture = {
    gmm: [],
    lower: thresholds[0],
    upper: thresholds[0],
  }

  const lpe: { l: number; p: number; upAvg: number; cp: number }[] = []
  crawlUpgrades(rollsLeft, (ns, p) => {
    const stat2 = { ...stats }
    if (calc4th) ns[3] += 1
    subs.forEach((subKey, i) => {
      stat2[subKey] = (stat2[subKey] ?? 0) + (17 / 2) * ns[i] * scale(subKey)
    })

    const obj = objectiveEval(stat2)
    const mu = obj.map((o) => o.v)
    const cov = obj.map((o1) =>
      obj.map((o2) =>
        o1.ks.reduce((pv, cv, k) => pv + o1.ks[k] * o2.ks[k] * ns[k], 0)
      )
    )
    const res = mvnPE(mu, cov, thresholds)
    lpe.push({ l: p, ...res })

    // Feels a little bad to discard everything but the first axis, but can change later
    appx.gmm.push({ phi: p, mu: mu[0], sig2: cov[0][0], cp: res.cp })
    appx.lower = Math.min(appx.lower, mu[0] - 4 * Math.sqrt(cov[0][0]))
    appx.upper = Math.max(appx.upper, mu[0] + 4 * Math.sqrt(cov[0][0]))
  })

  // Aggregate gaussian mixture statistics.
  let p_ret = 0,
    upAvg_ret = 0
  lpe.forEach(({ l, p, upAvg, cp }) => {
    // It's quite often that `p` becomes 0 here... should I use log likelihoods instead?
    p_ret += l * p * cp
    upAvg_ret += l * p * cp * upAvg
  })

  if (p_ret < 1e-10) return { prob: 0, upAvg: 0, distr: appx }
  upAvg_ret = upAvg_ret / p_ret
  return { prob: p_ret, upAvg: upAvg_ret, distr: appx }
}
