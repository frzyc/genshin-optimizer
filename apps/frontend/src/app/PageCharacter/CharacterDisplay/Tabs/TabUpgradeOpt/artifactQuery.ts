import type { ICachedArtifact } from '../../../../Types/artifact'
import { allSubstatKeys } from '../../../../Types/artifact'
import Artifact from '../../../../Data/Artifacts/Artifact'
import type { DynStat } from '../../../../Solver/common'
import type { Data, NumNode } from '../../../../Formula/type'
import type { OptNode } from '../../../../Formula/optimization'
import { precompute, optimize } from '../../../../Formula/optimization'
import { ddx, zero_deriv } from '../../../../Formula/differentiate'

import type { ArtifactSlotKey, RarityKey } from '@genshin-optimizer/consts'
import type { SubstatKey } from '@genshin-optimizer/pipeline'

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
export function querySetup(
  formulas: OptNode[],
  thresholds: number[],
  curBuild: QueryBuild,
  data: Data = {}
): Query {
  const toEval: OptNode[] = []
  formulas.forEach((f) => {
    toEval.push(
      f,
      ...allSubstatKeys.map((sub) => ddx(f, (fo) => fo.path[1], sub))
    )
  })
  // Opt loop a couple times to ensure all constants folded?
  let evalOpt = optimize(toEval, data, ({ path: [p] }) => p !== 'dyn')
  evalOpt = optimize(evalOpt, data, ({ path: [p] }) => p !== 'dyn')

  const evalFn = precompute(evalOpt, {}, (f) => f.path[1], 1)
  const stats = toStats(curBuild)
  const dmg0 = evalFn([{ id: '', values: stats }])[0]

  const skippableDerivs = allSubstatKeys.map((sub) =>
    formulas.every((f) => zero_deriv(f, (f) => f.path[1], sub))
  )
  const structuredEval = (stats: DynStat) => {
    const out = evalFn([{ id: '', values: stats }])
    return formulas.map((_, i) => {
      const ix = i * (1 + allSubstatKeys.length)
      return {
        v: out[ix],
        grads: allSubstatKeys.map((sub, si) => out[ix + 1 + si]),
      }
    })
  }

  return {
    formulas: formulas,
    thresholds: [dmg0, ...thresholds],
    curBuild: curBuild,
    evalFn: structuredEval,
    skippableDerivs: skippableDerivs,
  }
}

export function toQueryArtifact(art: ICachedArtifact, fixedLevel?: number) {
  if (fixedLevel === undefined) fixedLevel = art.level
  const mainStatVal = Artifact.mainStatValue(
    art.mainStatKey,
    art.rarity,
    fixedLevel
  ) // 5* only
  const buildData = {
    id: art.id,
    slot: art.slotKey,
    level: art.level,
    rarity: art.rarity,
    values: {
      [art.setKey]: 1,
      [art.mainStatKey]: art.mainStatKey.endsWith('_')
        ? mainStatVal / 100
        : mainStatVal,
      ...Object.fromEntries(
        art.substats.map((substat) => [
          substat.key,
          substat.key.endsWith('_')
            ? substat.accurateValue / 100
            : substat.accurateValue,
        ])
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

export function cmpQuery(a: QueryResult, b: QueryResult) {
  if (b.prob > 1e-5 || a.prob > 1e-5) return b.prob * b.upAvg - a.prob * a.upAvg

  const meanA = a.distr.gmm.reduce((pv, { phi, mu }) => pv + phi * mu, 0)
  const meanB = b.distr.gmm.reduce((pv, { phi, mu }) => pv + phi * mu, 0)
  return meanB - meanA
}

export type GaussianMixture = {
  gmm: {
    phi: number // Item weight; must sum to 1.
    cp: number // Constraint probability
    mu: number
    sig2: number
  }[]
  lower: number
  upper: number
}
export type Query = {
  formulas: NumNode[]
  curBuild: QueryBuild

  thresholds: number[]
  evalFn: (values: DynStat) => StructuredNumber[]
  skippableDerivs: boolean[]
}
export type QueryResult = {
  id: string
  rollsLeft: number
  subs: SubstatKey[]
  statsBase: DynStat
  evalFn: (values: DynStat) => StructuredNumber[]
  skippableDerivs: boolean[]

  prob: number
  upAvg: number
  distr: GaussianMixture
  thresholds: number[]
  fourthsubOpts?: { sub: SubstatKey; subprob: number }[]

  evalMode: 'fast' | 'slow'
}
type StructuredNumber = {
  v: number
  grads: number[]
}

export type QueryArtifact = {
  id: string
  level: number
  rarity: RarityKey
  slot: ArtifactSlotKey
  values: DynStat
  subs: SubstatKey[]
}
export type QueryBuild = { [key in ArtifactSlotKey]: QueryArtifact | undefined }
export type UpgradeOptResult = {
  query: Query
  arts: QueryResult[]
}
