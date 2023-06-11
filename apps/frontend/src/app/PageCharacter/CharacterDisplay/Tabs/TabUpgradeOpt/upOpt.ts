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
export type UpOptResult = {
  p: number
  upAvg: number
  distr: GaussianMixture

  evalMode: ResultType
}
export type UpOptArtifact = {
  id: string
  rollsLeft: number
  subs: SubstatKey[]
  values: DynStat
  slotKey: ArtifactSlotKey

  result?: UpOptResult
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

function scale(key: SubstatKey, rarity: RarityKey = 5) {
  return key.endsWith('_')
    ? Artifact.substatValue(key, rarity) / 1000
    : Artifact.substatValue(key, rarity) / 10
}

function toDecimal(key: SubstatKey | MainStatKey | '', value: number) {
  return key.endsWith('_') ? value / 100 : value
}

export class UpOptCalculator {
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

  evalFast(ix: number, subKey4th?: SubstatKey) {
    const { subs, slotKey, rollsLeft } = this.artifacts[ix]
    const stats = { ...this.artifacts[ix].values }
    const upgradesLeft = rollsLeft - (subs.length < 4 ? 1 : 0)

    // Increment stats to evaluate derivatives at "center" of upgrade distribution
    subs.forEach((subKey) => {
      stats[subKey] =
        (stats[subKey] ?? 0) + (17 / 2) * (upgradesLeft / 4) * scale(subKey)
    })
    if (subKey4th !== undefined) {
      stats[subKey4th] =
        (stats[subKey4th] ?? 0) +
        (17 / 2) * (upgradesLeft / 4 + 1) * scale(subKey4th)
    }

    // Compute upgrade estimates. For fast case, loop over probability for each stat
    //   independently, and take the minimum probability.
    const N = upgradesLeft
    const obj = this.eval(stats, slotKey)
    for (let ix = 0; ix < obj.length; ix++) {
      const { v, grads } = obj[ix]
      const ks = grads
        .map((g, i) => g * scale(allSubstatKeys[i]))
        .filter(
          (g, i) =>
            subs.includes(allSubstatKeys[i]) || allSubstatKeys[i] === subKey4th
        )
      const ksum = ks.reduce((a, b) => a + b, 0)
      const ksum2 = ks.reduce((a, b) => a + b * b, 0)

      const mean = v
      let variance = ((147 / 8) * ksum2 - (289 / 64) * ksum ** 2) * N
      if (subKey4th) {
        const k4th = grads[allSubstatKeys.indexOf(subKey4th)] * scale(subKey4th)
        variance += (5 / 4) * k4th * k4th
      }

      const { p, upAvg } = gaussianPE(mean, variance, this.thresholds[ix])
      if (ix === 0) {
        // Store fast eval result on first iteration.
        this.artifacts[ix].result = {
          p,
          upAvg,
          distr: {
            gmm: [{ phi: 1, mu: mean, sig2: variance, cp: 1 }],
            lower: mean - 4 * Math.sqrt(variance),
            upper: mean + 4 * Math.sqrt(variance),
          },
          evalMode: ResultType.Fast,
        }
      }
      this.artifacts[ix].result!.p = Math.min(p, this.artifacts[ix].result!.p)
    }
  }
}
