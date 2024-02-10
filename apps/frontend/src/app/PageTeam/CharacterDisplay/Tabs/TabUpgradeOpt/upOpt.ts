import type {
  ArtifactRarity,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import {
  optimize,
  precompute,
  type OptNode,
} from '../../../../Formula/optimization'

import { cartesian, range } from '@genshin-optimizer/common/util'
import { allSubstatKeys, artMaxLevel } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi/dm'
import {
  getMainStatDisplayValue,
  getRollsRemaining,
  getSubstatValue,
} from '@genshin-optimizer/gi/util'
import { ddx, zero_deriv } from '../../../../Formula/differentiate'
import type { ArtifactBuildData, DynStat } from '../../../../Solver/common'
import { crawlUpgrades, quadrinomial } from './mathUtil'
import { gaussianPE, mvnPE_bad } from './mvncdf'

/**
 * Artifact upgrade distribution math summary.
 *
 * Let A be the upgrade distribution of some artifact `art0`. We write
 *  art ~ A to say `art` is a random artifact drawn from the
 *  upgrade distribution `A`.
 * With f(art) being damage function of the 1-swap of an artifact,
 *  we write dmg ~ f(A) to say `dmg` is a random number sampled by
 *  the process:  art ~ A ; dmg = f(art)
 *
 * To approximate f(A), we take the linear approximation of upgrade
 *  distribution of an artifact.
 *           L(art) = f(art0) + sum_i ∂f/∂x_i * s_i * RV_i
 *       L(art)  - Linear approximation of damage function
 *       ∂f/∂x_i - derivative of f wrt substat i (at art0)
 *       s_i     - "scale" of substat i
 *       RV_i    - roll value of substat i
 * Let k_i = ∂f/∂x_i * s_i below.
 *
 * The roll value is the sum of n_i uniform distributions {7, 8, 9, 10}.
 *  We approximate it with a Normal distribution:
 *          RV_i = N[ 8.5n_i, 1.25n_i ]
 *     n_i - number of upgrades for substat i
 * Magic numbers µ = 17/2 and ν = 5/4 come from the mean & std.dev of RV.
 *
 * The substat upgrades are chosen uniform randomly per roll, so
 *  the n_i follow a multinomial distribution. So the linearized
 *  dmg distribution `L(A)` can be written:
 *    L(A) = sum σ(n1, n2, n3, n4) * (f(art0) + sum_i k_i * RV_i(n_i))
 *          σ(n1, n2, n3, n4) - Multinomial distribution for upgrade numbers
 *                              with total n1 + n2 + n3 + n4 = N
 *  where the first sum is over the (n1, n2, n3, n4) of the multinomial
 *  distribution.
 *
 * =========== SLOW APPROXIMATION ==========
 * Because L(A) is written as the sum of Normal distributions, we
 *  can write it as a Gaussian Mixture. We can perform probability
 *  queries following ordinary Gaussian Mixture methods.
 * Note that in the code, `art0` is chosen as a function of n_i to
 *  account for the guaranteed stats due to the number of rolls.
 *
 * =========== FAST APPROXIMATION ==========
 * The Fast method approximates the slow Mixture distribution by matching
 *  the 1st and 2nd moments. This is not expected to be a good approximation;
 *  it's only useful for a ball-park estimate of the upgrade probability.
 * Note that in here, `art0` is fixed wrt n_i.
 *  mean of L(A) = f(art0) + sum_i mean(n_i) * µ k_i
 *  variance of L(A) = sum_i (mean(n_i)/4 * ν k_i^2 + N/4 (µ k_i)^2)
 *                     - N * (sum_i µ/4 k_i)^2
 *                   = N * (Q * sum_i k_i^2 - W * (sum_i k_i)^2)
 *            where Q = (ν + µ^2)/4 and W = (µ / 4)^2
 */
const up_rv_mean = 17 / 2
const up_rv_stdev = 5 / 4
const Q = (up_rv_stdev + up_rv_mean ** 2) / 4
const W = (up_rv_mean / 4) ** 2

export enum ResultType {
  Fast,
  Slow,
  Exact,
}
export type UpOptBuild = {
  [key in ArtifactSlotKey]: ArtifactBuildData | undefined
}
export type UpOptArtifact = {
  id: string
  rollsLeft: number
  mainStat: MainStatKey
  subs: SubstatKey[]
  values: DynStat
  slotKey: ArtifactSlotKey

  result?: UpOptResult
}
export type UpOptResult = {
  p: number
  upAvg: number
  distr: GaussianMixture
  evalMode: ResultType
}
type GaussianMixture = {
  gmm: {
    phi: number // Item weight; must sum to 1.
    cp: number // Constraint probability
    mu: number
    sig2: number
  }[]

  // Store estimates of left and right bounds of distribution for visualization.
  lower: number
  upper: number
}

// TODO: put this into a `constants` files somewhere.
/* substat roll weights */
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

/* Gets "0.1x" 1 roll value for a stat w/ the given rarity. */
function scale(key: SubstatKey, rarity: ArtifactRarity = 5) {
  return toDecimal(key, getSubstatValue(key, rarity) / 10)
}

/* Fixes silliness with percents and being multiplied by 100. */
function toDecimal(key: SubstatKey | MainStatKey | '', value: number) {
  return key.endsWith('_') ? value / 100 : value
}

export class UpOptCalculator {
  /**
   * Calculator class to track artifacts and their evaluation status. Method overview:
   *    constructor(OptNode[], number[], Build):  Upgrade problem setup
   *    addArtifact(ICachedArtifact):             Add an artifact to be considered
   *    evalFast/Slow/Exact(number, bool):        Evaluate an artifact with X method and keep track of results
   */
  baseBuild: UpOptBuild
  nodes: OptNode[]
  thresholds: number[]
  calc4th = false

  skippableDerivatives: boolean[]
  eval: (
    stats: DynStat,
    slot: ArtifactSlotKey
  ) => { v: number; grads: number[] }[]

  artifacts: UpOptArtifact[] = []
  fixedIx = 0

  /**
   * Constructs UpOptCalculator.
   * @param nodes Formulas to find upgrades for. nodes[0] is main objective, the rest are constraints.
   * @param thresholds Constraint values. thresholds[0] will be auto-populated with current objective value.
   * @param build Build to check 1-swaps against.
   * @param artifacts List of artifacts to consider upgrading.
   */
  constructor(
    nodes: OptNode[],
    thresholds: number[],
    build: UpOptBuild,
    artifacts: ICachedArtifact[]
  ) {
    this.baseBuild = build
    this.nodes = nodes
    this.thresholds = thresholds

    const toEval: OptNode[] = []
    nodes.forEach((n) => {
      toEval.push(
        n,
        ...allSubstatKeys.map((sub) => ddx(n, (fo) => fo.path[1], sub))
      )
    })
    const evalOpt = optimize(toEval, {}, ({ path: [p] }) => p !== 'dyn')

    const evalFn = precompute(evalOpt, {}, (f) => f.path[1], 5)
    thresholds[0] = evalFn(
      Object.values(build) as ArtifactBuildData[] & { length: 5 }
    )[0] // dmg threshold is current objective value

    this.skippableDerivatives = allSubstatKeys.map((sub) =>
      nodes.every((n) => zero_deriv(n, (f) => f.path[1], sub))
    )
    this.eval = (stats: DynStat, slot: ArtifactSlotKey) => {
      const b2 = { ...build, [slot]: { id: '', values: stats } }
      const out = evalFn(
        Object.values(b2) as ArtifactBuildData[] & { length: 5 }
      )
      return nodes.map((_, i) => {
        const ix = i * (1 + allSubstatKeys.length)
        return {
          v: out[ix],
          grads: allSubstatKeys.map((sub, si) => out[ix + 1 + si]),
        }
      })
    }

    artifacts.forEach((art) => this._addArtifact(art))
  }

  /** Adds an artifact to be tracked by UpOptCalc. It is initially un-evaluated. */
  _addArtifact(art: ICachedArtifact) {
    const maxLevel = artMaxLevel[art.rarity]
    const mainStatVal = getMainStatDisplayValue(
      art.mainStatKey,
      art.rarity,
      maxLevel
    ) // 5* only

    this.artifacts.push({
      id: art.id,
      rollsLeft: getRollsRemaining(art.level, art.rarity),
      slotKey: art.slotKey,
      mainStat: art.mainStatKey,
      subs: art.substats
        .map(({ key }) => key)
        .filter((v) => v !== '') as SubstatKey[],
      values: {
        [art.setKey]: 1,
        [art.mainStatKey]: toDecimal(art.mainStatKey, mainStatVal),
        ...Object.fromEntries(
          art.substats
            .filter(({ key }) => key !== '')
            .map((substat) => [
              substat.key,
              toDecimal(substat.key, substat.accurateValue),
            ])
        ), // Assumes substats cannot match main stat key
      },
    })
  }

  /** Calcs all artifacts using Fast method */
  calcFastAll() {
    function score(a: UpOptArtifact) {
      return a.result!.p * a.result!.upAvg
    }
    this.artifacts.forEach((_, i) => this.calcFast(i, this.calc4th))
    this.artifacts.sort((a, b) => score(b) - score(a))
    this.fixedIx = 0
  }

  calcSlowToIndex(ix: number, lookahead = 5) {
    const fixedList = this.artifacts.slice(0, this.fixedIx)
    const arr = this.artifacts.slice(this.fixedIx)

    function score(a: UpOptArtifact) {
      return a.result!.p * a.result!.upAvg
    }
    function compare(a: UpOptArtifact, b: UpOptArtifact) {
      if (score(a) > 1e-5 || score(b) > 1e-5) return score(b) - score(a)

      const meanA = a.result!.distr.gmm.reduce(
        (pv, { phi, mu }) => pv + phi * mu,
        0
      )
      const meanB = b.result!.distr.gmm.reduce(
        (pv, { phi, mu }) => pv + phi * mu,
        0
      )
      return meanB - meanA
    }

    // Assume `fixedList` is all slowEval'd.
    let i = 0
    const end = Math.min(ix - this.fixedIx + lookahead, arr.length)
    do {
      for (; i < end; i++) this.calcSlow(this.fixedIx + i, this.calc4th)

      arr.sort(compare)
      this.artifacts = [...fixedList, ...arr]
      for (i = 0; i < end; i++) {
        if (arr[i].result!.evalMode === ResultType.Fast) break
      }
    } while (i < end)
  }

  /**
   * Convert Fast method numbers to Result type.
   *
   * Each target/constraint is treated as an independent 1D Gaussian, but we try
   *   to over-estimate the true constraint probability by using the min() probability
   *   of each constraint (rather than their product). If multiple Gaussians are
   *   present in `distr[]`, they are aggregated following standard mixture distribution methods.
   */
  _toResultFast(
    distr: { prob: number; mu: number[]; cov: number[] }[]
  ): UpOptResult {
    let ptot = 0
    let upAvgtot = 0
    const gmm = distr.map(({ prob, mu, cov }) => {
      const z = mu.map((mui, i) => {
        return gaussianPE(mui, cov[i], this.thresholds[i])
      })
      const p = Math.min(...z.map(({ p }) => p))
      const cp = Math.min(...z.slice(1).map(({ p }) => p))
      ptot += p * prob
      upAvgtot += p * prob * z[0].upAvg
      return { phi: prob, cp, mu: mu[0], sig2: cov[0] }
    })
    const lowers = gmm.map(({ mu, sig2 }) => mu - 4 * Math.sqrt(sig2))
    const uppers = gmm.map(({ mu, sig2 }) => mu + 4 * Math.sqrt(sig2))
    return {
      p: ptot,
      upAvg: ptot < 1e-6 ? 0 : upAvgtot / ptot,
      distr: { gmm, lower: Math.min(...lowers), upper: Math.max(...uppers) },
      evalMode: ResultType.Fast,
    }
  }

  /**
   * Evaluates artifact using Fast method.
   * Selection details based on artifacts[ix]
   */
  calcFast(ix: number, calc4th = true) {
    if (this.artifacts[ix].subs.length === 4) calc4th = false
    if (calc4th) this._calcFast4th(ix)
    else this._calcFast(ix)
  }

  /**
   * Fast evaluation of 4-line artifact.
   * If a 3-line artifact is passed, the 4th substat possibilities are ignored.
   */
  _calcFast(ix: number) {
    const { subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - (subs.length < 4 ? 1 : 0) // only for 5*

    const stats = { ...this.artifacts[ix].values }
    subs.forEach((subKey) => {
      stats[subKey] += up_rv_mean * (N / 4) * scale(subKey)
    })
    const objective = this.eval(stats, slotKey)
    const gaussians = objective.map(({ v: mu, grads }) => {
      const ks = subs.map(
        (sub) => grads[allSubstatKeys.indexOf(sub)] * scale(sub)
      )
      const ksum = ks.reduce((a, b) => a + b, 0)
      const ksum2 = ks.reduce((a, b) => a + b * b, 0)
      const sig2 = (Q * ksum2 - W * ksum ** 2) * N

      return { mu, sig2 }
    })

    this.artifacts[ix].result = this._toResultFast([
      {
        prob: 1,
        mu: gaussians.map(({ mu }) => mu),
        cov: gaussians.map(({ sig2 }) => sig2),
      },
    ])
  }

  /**
   * Fast evaluation of a 3-line artifact, considering all possiblilties for its 4th stats.
   * Passing a 4-line artifact will result in inaccurate results.
   */
  _calcFast4th(ix: number) {
    const { mainStat, subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - 1 // Minus 1 because 4th slot takes 1.

    const subsToConsider = allSubstatKeys.filter(
      (s) => !subs.includes(s) && s !== mainStat
    )

    const Z = subsToConsider.reduce((tot, sub) => tot + fWeight[sub], 0)
    const distr = subsToConsider.map((subKey4) => {
      const prob = fWeight[subKey4] / Z
      const stats = { ...this.artifacts[ix].values }
      subs.forEach((subKey) => {
        stats[subKey] += up_rv_mean * (N / 4) * scale(subKey)
      })
      stats[subKey4] =
        (stats[subKey4] ?? 0) + up_rv_mean * (N / 4 + 1) * scale(subKey4)

      const objective = this.eval(stats, slotKey)
      const gaussians = objective.map(({ v: mu, grads }) => {
        const ks = subs.map(
          (sub) => grads[allSubstatKeys.indexOf(sub)] * scale(sub)
        )
        const k4 = grads[allSubstatKeys.indexOf(subKey4)] * scale(subKey4)
        const ksum = ks.reduce((a, b) => a + b, k4)
        const ksum2 = ks.reduce((a, b) => a + b * b, k4 * k4)
        const sig2 = (Q * ksum2 - W * ksum ** 2) * N + up_rv_stdev * k4 * k4

        return { mu, sig2 }
      })

      return {
        prob,
        mu: gaussians.map(({ mu }) => mu),
        cov: gaussians.map(({ sig2 }) => sig2),
      }
    })

    this.artifacts[ix].result = this._toResultFast(distr)
  }

  /**
   * Convert Slow method numbers to Result type.
   * Here, targets and constraints are treated as multi-dimensional Gaussians with
   *   non-zero covariances. The probabilities are evaluated using `mvncdf` and aggregated
   *   following standard mixture distribution methods.
   */
  _toResultSlow(
    distr: { prob: number; mu: number[]; cov: number[][] }[]
  ): UpOptResult {
    let ptot = 0
    let upAvgtot = 0
    const gmm = distr.map(({ prob, mu, cov }) => {
      const { p, upAvg, cp } = mvnPE_bad(mu, cov, this.thresholds)
      ptot += prob * p
      upAvgtot += prob * p * upAvg
      return { phi: prob, cp, mu: mu[0], sig2: cov[0][0] }
    })
    const lowers = gmm.map(({ mu, sig2 }) => mu - 4 * Math.sqrt(sig2))
    const uppers = gmm.map(({ mu, sig2 }) => mu + 4 * Math.sqrt(sig2))
    return {
      p: ptot,
      upAvg: ptot < 1e-6 ? 0 : upAvgtot / ptot,
      distr: {
        gmm,
        lower: Math.min(...lowers, this.thresholds[0]),
        upper: Math.max(...uppers, this.thresholds[0]),
      },
      evalMode: ResultType.Slow,
    }
  }

  /** Selects evaluation method based on details of artifacts[ix] */
  calcSlow(ix: number, calc4th = true) {
    if (
      this.artifacts[ix].result?.evalMode === ResultType.Slow ||
      this.artifacts[ix].result?.evalMode === ResultType.Exact
    )
      return
    if (this.artifacts[ix].subs.length === 4) calc4th = false
    if (calc4th) this._calcSlow4th(ix)
    else this._calcSlow(ix)
  }

  /**
   * Slow evaluation of 4-line artifact.
   * If a 3-line artifact is passed, the 4th substat possibilities are ignored.
   */
  _calcSlow(ix: number) {
    const { subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - (subs.length < 4 ? 1 : 0) // only for 5*

    const distrs: { prob: number; mu: number[]; cov: number[][] }[] = []
    crawlUpgrades(N, (ns, prob) => {
      const stats = { ...this.artifacts[ix].values }
      subs.forEach((subKey, i) => {
        stats[subKey] += up_rv_mean * ns[i] * scale(subKey)
      })

      const objective = this.eval(stats, slotKey)
      const obj_ks = objective.map(({ grads }) =>
        subs.map((sub) => grads[allSubstatKeys.indexOf(sub)] * scale(sub))
      )
      const mu = objective.map((o) => o.v)
      const cov = obj_ks.map((k1) =>
        obj_ks.map((k2) =>
          k1.reduce((pv, cv, j) => pv + k1[j] * k2[j] * ns[j], 0)
        )
      )
      distrs.push({ prob, mu, cov })
    })

    this.artifacts[ix].result = this._toResultSlow(distrs)
  }

  /**
   * Slow evaluation of a 3-line artifact, considering all possiblilties for its 4th stats.
   * Passing a 4-line artifact will result in inaccurate results.
   */
  _calcSlow4th(ix: number) {
    const { mainStat, subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - 1 // only for 5*

    const subsToConsider = allSubstatKeys.filter(
      (s) => !subs.includes(s) && s !== mainStat
    )

    const Z = subsToConsider.reduce((tot, sub) => tot + fWeight[sub], 0)
    const distrs: { prob: number; mu: number[]; cov: number[][] }[] = []
    subsToConsider.forEach((subKey4) => {
      crawlUpgrades(N, (ns, prob) => {
        prob = prob * (fWeight[subKey4] / Z)
        const stats = { ...this.artifacts[ix].values }
        ns[3] += 1 // last substat has initial roll
        subs.forEach((subKey, i) => {
          stats[subKey] += up_rv_mean * ns[i] * scale(subKey)
        })
        stats[subKey4] =
          (stats[subKey4] ?? 0) + up_rv_mean * ns[3] * scale(subKey4)

        const objective = this.eval(stats, slotKey)
        const obj_ks = objective.map(({ grads }) => {
          const ks = subs.map(
            (sub) => grads[allSubstatKeys.indexOf(sub)] * scale(sub)
          )
          ks.push(grads[allSubstatKeys.indexOf(subKey4)] * scale(subKey4))
          return ks
        })
        const mu = objective.map((o) => o.v)
        const cov = obj_ks.map((k1) =>
          obj_ks.map((k2) =>
            k1.reduce((pv, cv, j) => pv + k1[j] * k2[j] * ns[j], 0)
          )
        )
        distrs.push({ prob, mu, cov })
      })
    })

    this.artifacts[ix].result = this._toResultSlow(distrs)
  }

  /**
   * Convert Exact method numbers to Result type.
   *
   * Exact results have no variance, so we can directly check each upgrade branch
   *   to compute the exact probability and upgrade value.
   */
  _toResultExact(distr: { prob: number; val: number[] }[]): UpOptResult {
    let ptot = 0
    let upAvgtot = 0
    const gmm = distr.map(({ prob, val }) => {
      if (val.every((vi, i) => vi >= this.thresholds[i])) {
        ptot += prob
        upAvgtot += prob * (val[0] - this.thresholds[0])
        return { phi: prob, cp: 1, mu: val[0], sig2: 0 }
      }
      const consOK = val.slice(1).every((vi, i) => vi >= this.thresholds[i])
      return { phi: prob, cp: consOK ? 1 : 0, mu: val[0], sig2: 0 }
    })

    const vals = gmm.map(({ mu }) => mu)
    return {
      p: ptot,
      upAvg: ptot < 1e-6 ? 0 : upAvgtot / ptot,
      distr: { gmm, lower: Math.min(...vals), upper: Math.max(...vals) },
      evalMode: ResultType.Exact,
    }
  }

  /**
   * Evaluates artifact using Exact method.
   * Selection details based on artifacts[ix]
   */
  calcExact(ix: number, calc4th = true) {
    if (this.artifacts[ix].result?.evalMode === ResultType.Exact) return
    if (this.artifacts[ix].subs.length === 4) calc4th = false
    if (calc4th) this._calcExact4th(ix)
    else this._calcExact(ix)
  }

  /**
   * Exact evaluation of 4-line artifact.
   * If a 3-line artifact is passed, the 4th substat possibilities are ignored.
   */
  _calcExact(ix: number) {
    const { subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - (subs.length < 4 ? 1 : 0) // only for 5*

    const distrs: { prob: number; val: number[] }[] = []
    crawlUpgrades(N, (ns, prob) => {
      const base = { ...this.artifacts[ix].values }
      const vals = ns.map((ni, i) =>
        subs[i] && !this.skippableDerivatives[allSubstatKeys.indexOf(subs[i])]
          ? range(7 * ni, 10 * ni)
          : [NaN]
      )

      cartesian(...vals).forEach((upVals) => {
        const stats = { ...base }
        let p_upVals = 1
        for (let i = 0; i < 4; i++) {
          if (isNaN(upVals[i])) continue

          const key = subs[i]
          const val = upVals[i]
          const ni = ns[i]
          stats[key] = (stats[key] ?? 0) + val * scale(key)
          const p_val = 4 ** -ni * quadrinomial(ni, val - 7 * ni)
          p_upVals *= p_val
        }

        distrs.push({
          prob: prob * p_upVals,
          val: this.eval(stats, slotKey).map((n) => n.v),
        })
      })
    })

    this.artifacts[ix].result = this._toResultExact(distrs)
  }

  /**
   * Exact evaluation of a 3-line artifact, considering all possiblilties for its 4th stats.
   * Passing a 4-line artifact will result in inaccurate results.
   */
  _calcExact4th(ix: number) {
    const { mainStat, subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - 1 // only for 5*

    const subsToConsider = allSubstatKeys.filter(
      (s) => !subs.includes(s) && s !== mainStat
    )
    const Z = subsToConsider.reduce((tot, sub) => tot + fWeight[sub], 0)
    const distrs: { prob: number; val: number[] }[] = []
    subsToConsider.forEach((subKey4) => {
      const prob_sub = fWeight[subKey4] / Z
      crawlUpgrades(N, (ns, prob) => {
        const vals = ns.map((ni, i) => {
          if (i === 3) {
            // 4th sub gets 1 initial roll.
            ni += 1
            return !this.skippableDerivatives[allSubstatKeys.indexOf(subKey4)]
              ? range(7 * ni, 10 * ni)
              : [NaN]
          }
          return subs[i] &&
            !this.skippableDerivatives[allSubstatKeys.indexOf(subs[i])]
            ? range(7 * ni, 10 * ni)
            : [NaN]
        })

        cartesian(...vals).forEach((upVals) => {
          const stats = { ...this.artifacts[ix].values }
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
          if (!isNaN(upVals[3])) {
            // i = 3 case
            const key = subKey4
            const val = upVals[3]
            const ni = ns[3] + 1
            stats[key] = (stats[key] ?? 0) + val * scale(key)
            const p_val = 4 ** -ni * quadrinomial(ni, val - 7 * ni)
            p_upVals *= p_val
          }

          distrs.push({
            prob: prob_sub * prob * p_upVals,
            val: this.eval(stats, slotKey).map((n) => n.v),
          })
        })
      })
    })

    this.artifacts[ix].result = this._toResultExact(distrs)
  }
}

/* ICachedArtifact to ArtifactBuildData. Maybe this should go in common? */
export function toArtifact(art: ICachedArtifact): ArtifactBuildData {
  const mainStatVal = toDecimal(
    art.mainStatKey,
    getMainStatDisplayValue(art.mainStatKey, art.rarity, art.level)
  ) // 5* only
  const buildData = {
    id: art.id,
    slot: art.slotKey,
    level: art.level,
    rarity: art.rarity,
    values: {
      [art.setKey]: 1,
      [art.mainStatKey]: mainStatVal,
      ...Object.fromEntries(
        art.substats
          .map((substat) => [
            substat.key,
            toDecimal(substat.key, substat.accurateValue),
          ])
          .filter(([, value]) => value !== 0)
      ),
    },
    subs: art.substats.reduce((sub: SubstatKey[], x) => {
      if (x.key !== '') sub.push(x.key)
      return sub
    }, []),
  }
  delete buildData.values['']
  return buildData
}
