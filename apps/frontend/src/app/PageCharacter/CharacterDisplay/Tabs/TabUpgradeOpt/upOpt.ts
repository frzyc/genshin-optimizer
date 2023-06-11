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

import { gaussianPE } from './mvncdf'

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

  evalFast(ix: number, calc4th = false) {
    const { mainStat, subs, slotKey, rollsLeft } = this.artifacts[ix]

    const sub4thOptions: { prob: number; sub?: SubstatKey }[] = []
    if (!calc4th) {
      sub4thOptions.push({ prob: 1 })
    } else {
      const subsToConsider = allSubstatKeys.filter(
        (s) => !subs.includes(s) && s !== mainStat
      )

      const Z = subsToConsider.reduce((tot, sub) => tot + fWeight[sub], 0)
      subsToConsider.forEach((sub) =>
        sub4thOptions.push({ prob: fWeight[sub] / Z, sub })
      )
    }

    const evalResults = sub4thOptions.map(({ prob, sub: subKey4 }) => {
      const stats = { ...this.artifacts[ix].values }
      const upgradesLeft = rollsLeft - (subs.length < 4 ? 1 : 0)

      // Increment stats to evaluate derivatives at "center" of upgrade distribution
      subs.forEach((subKey) => {
        stats[subKey] =
          (stats[subKey] ?? 0) + (17 / 2) * (upgradesLeft / 4) * scale(subKey)
      })
      if (subKey4 !== undefined) {
        stats[subKey4] =
          (stats[subKey4] ?? 0) +
          (17 / 2) * (upgradesLeft / 4 + 1) * scale(subKey4)
      }

      // Compute upgrade estimates. For fast case, loop over probability for each stat
      //   independently, and take the minimum probability.
      const N = upgradesLeft
      const obj = this.eval(stats, slotKey)
      const results: UpOptResult[] = obj.map(({ v: mean, grads }, fi) => {
        const ks = grads
          .map((g, i) => g * scale(allSubstatKeys[i]))
          .filter(
            (g, i) =>
              subs.includes(allSubstatKeys[i]) || allSubstatKeys[i] === subKey4
          )
        const ksum = ks.reduce((a, b) => a + b, 0)
        const ksum2 = ks.reduce((a, b) => a + b * b, 0)

        let variance = ((147 / 8) * ksum2 - (289 / 64) * ksum ** 2) * N
        if (subKey4) {
          const k4 = grads[allSubstatKeys.indexOf(subKey4)] * scale(subKey4)
          variance += (5 / 4) * k4 ** 2
        }

        const { p, upAvg } = gaussianPE(mean, variance, this.thresholds[fi])
        return {
          p,
          upAvg,
          distr: {
            gmm: [{ phi: 1, mu: mean, sig2: variance, cp: 1 }],
            lower: mean - 4 * Math.sqrt(variance),
            upper: mean + 4 * Math.sqrt(variance),
          },
          evalMode: ResultType.Fast,
        }
      })

      results[0].p = Math.min(...results.map(({ p }) => p))
      return { prob, result: results[0] }
    })

    const ptot = evalResults.reduce(
      (ptot, { prob, result: { p } }) => ptot + prob * p,
      0
    )
    const aggResult: UpOptResult = {
      p: ptot,
      upAvg: 0,
      distr: { gmm: [], lower: Infinity, upper: -Infinity },
      evalMode: ResultType.Fast,
    }

    evalResults.forEach(({ prob, result: { p, upAvg, distr } }) => {
      aggResult.upAvg += ptot < 1e-6 ? 0 : (prob * p * upAvg) / ptot
      aggResult.distr.gmm.push(
        ...distr.gmm.map((g) => ({ ...g, phi: prob * g.phi })) // Scale each component by `prob`
      )
      aggResult.distr.lower = Math.min(aggResult.distr.lower, distr.lower)
      aggResult.distr.upper = Math.max(aggResult.distr.upper, distr.upper)
    })

    this.artifacts[ix].result = aggResult
  }
}
