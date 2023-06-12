import type { ArtifactSlotKey, RarityKey } from '@genshin-optimizer/consts'
import {
  optimize,
  precompute,
  type OptNode,
} from '../../../../Formula/optimization'

import type { ICachedArtifact } from '../../../../Types/artifact'
import { allSubstatKeys } from '../../../../Types/artifact'
import { ddx, zero_deriv } from '../../../../Formula/differentiate'
import type { ArtifactBuildData, DynStat } from '../../../../Solver/common'
import Artifact, { maxArtifactLevel } from '../../../../Data/Artifacts/Artifact'
import type { MainStatKey, SubstatKey } from '@genshin-optimizer/dm'

import { gaussianPE, mvnPE_bad } from './mvncdf'
import { crawlUpgrades } from './artifactUpgradeCrawl'

enum ResultType {
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
function scale(key: SubstatKey, rarity: RarityKey = 5) {
  return toDecimal(key, Artifact.substatValue(key, rarity)) / 10
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

  skippableDerivatives: boolean[]
  eval: (
    stats: DynStat,
    slot: ArtifactSlotKey
  ) => { v: number; grads: number[] }[]

  artifacts: UpOptArtifact[] = []

  /**
   * Constructs UpOptCalculator.
   * @param nodes Formulas to find upgrades for. nodes[0] is main objective, the rest are constraints.
   * @param thresholds Constraint values. thresholds[0] will be auto-populated with current objective value.
   * @param build Build to check 1-swaps against.
   */
  constructor(nodes: OptNode[], thresholds: number[], build: UpOptBuild) {
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
    thresholds[0] = evalFn(Object.values(build))[0] // dmg threshold is current objective value

    this.skippableDerivatives = allSubstatKeys.map((sub) =>
      nodes.every((n) => zero_deriv(n, (f) => f.path[1], sub))
    )
    this.eval = (stats: DynStat, slot: ArtifactSlotKey) => {
      const b2 = { ...build, [slot]: { id: '', values: stats } }
      const out = evalFn(Object.values(b2))
      return nodes.map((_, i) => {
        const ix = i * (1 + allSubstatKeys.length)
        return {
          v: out[ix],
          grads: allSubstatKeys.map((sub, si) => out[ix + 1 + si]),
        }
      })
    }
  }

  /** Adds an artifact to be tracked by UpOptCalc. It is initially un-evaluated. */
  addArtifact(art: ICachedArtifact) {
    const maxLevel = maxArtifactLevel[art.rarity]
    const mainStatVal = Artifact.mainStatValue(
      art.mainStatKey,
      art.rarity,
      maxLevel
    ) // 5* only

    this.artifacts.push({
      id: art.id,
      rollsLeft: Artifact.rollsRemaining(art.level, art.rarity),
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

  /* Fast distribution to result. */
  toResult1(
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

  calcFast(ix: number, calc4th = true) {
    if (this.artifacts[ix].subs.length === 4) calc4th = false
    if (calc4th) this._calcFast4th(ix)
    else this._calcFast(ix)
  }

  _calcFast(ix: number) {
    const { subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - (subs.length < 4 ? 1 : 0) // only for 5*

    const stats = { ...this.artifacts[ix].values }
    subs.forEach((subKey) => {
      stats[subKey] += (17 / 2) * (N / 4) * scale(subKey)
    })
    const objective = this.eval(stats, slotKey)
    const gaussians = objective.map(({ v: mu, grads }) => {
      const ks = subs.map(
        (sub) => grads[allSubstatKeys.indexOf(sub)] * scale(sub)
      )
      const ksum = ks.reduce((a, b) => a + b, 0)
      const ksum2 = ks.reduce((a, b) => a + b * b, 0)
      const sig2 = ((147 / 8) * ksum2 - (289 / 64) * ksum ** 2) * N

      return { mu, sig2 }
    })

    this.artifacts[ix].result = this.toResult1([
      {
        prob: 1,
        mu: gaussians.map(({ mu }) => mu),
        cov: gaussians.map(({ sig2 }) => sig2),
      },
    ])
  }

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
        stats[subKey] += (17 / 2) * (N / 4) * scale(subKey)
      })
      stats[subKey4] =
        (stats[subKey4] ?? 0) + (17 / 2) * (N / 4 + 1) * scale(subKey4)

      const objective = this.eval(stats, slotKey)
      const gaussians = objective.map(({ v: mu, grads }) => {
        const ks = subs.map(
          (sub) => grads[allSubstatKeys.indexOf(sub)] * scale(sub)
        )
        const k4 = grads[allSubstatKeys.indexOf(subKey4)] * scale(subKey4)
        const ksum = ks.reduce((a, b) => a + b, k4)
        const ksum2 = ks.reduce((a, b) => a + b * b, k4 * k4)
        const sig2 =
          ((147 / 8) * ksum2 - (289 / 64) * ksum ** 2) * N + (5 / 4) * k4 * k4

        return { mu, sig2 }
      })

      return {
        prob,
        mu: gaussians.map(({ mu }) => mu),
        cov: gaussians.map(({ sig2 }) => sig2),
      }
    })

    this.artifacts[ix].result = this.toResult1(distr)
  }

  toResult2(
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

  calcSlow(ix: number, calc4th = true) {
    if (this.artifacts[ix].subs.length === 4) calc4th = false
    if (calc4th) this._calcSlow4th(ix)
    else this._calcSlow(ix)
  }

  _calcSlow(ix: number) {
    const { subs, slotKey, rollsLeft } = this.artifacts[ix]
    const N = rollsLeft - (subs.length < 4 ? 1 : 0) // only for 5*

    const distrs: { prob: number; mu: number[]; cov: number[][] }[] = []
    crawlUpgrades(N, (ns, prob) => {
      const stats = { ...this.artifacts[ix].values }
      subs.forEach((subKey, i) => {
        stats[subKey] += (17 / 2) * ns[i] * scale(subKey)
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

    this.artifacts[ix].result = this.toResult2(distrs)
  }

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
          stats[subKey] += (17 / 2) * ns[i] * scale(subKey)
        })
        stats[subKey4] =
          (stats[subKey4] ?? 0) + (17 / 2) * ns[3] * scale(subKey4)

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

    this.artifacts[ix].result = this.toResult2(distrs)
  }
}
