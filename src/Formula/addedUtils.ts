import { constant, prod, cmp } from "./utils"
import { NumNode } from "./type"
import { optimize } from "./optimization"
import { mapFormulas } from "./internal"
import { ArtifactBuildData, ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { LinearForm, maxWeight, toLinearUpperBound } from "./linearUpperBound"
import { expandPoly, productPossible } from "./expandPoly"
import { ArtifactSetKey } from "../Types/consts"

export function slotUpperLower(a: ArtifactBuildData[]) {
  let statsMin: DynStat = {}
  let statsMax: DynStat = {}
  let sets = new Set<ArtifactSetKey | undefined>()
  a.forEach(art => {
    for (const statKey in art.values) {
      statsMin[statKey] = Math.min(art.values[statKey], statsMin[statKey] ?? Infinity)
      statsMax[statKey] = Math.max(art.values[statKey], statsMax[statKey] ?? -Infinity)
    }
    if (art.set) {
      statsMax[art.set] = 1
      statsMin[art.set] = 0
    }
    sets.add(art.set)
  })
  if (sets.size === 1 && a[0].set) statsMin[a[0].set] = 1
  return { statsMin, statsMax }
}

export function statsUpperLower(a: ArtifactsBySlot) {
  let statsMin: DynStat = { ...a.base }
  let statsMax: DynStat = { ...a.base }
  Object.entries(a.values).forEach(([slotKey, slotArts]) => {
    const { statsMin: smin, statsMax: smax } = slotUpperLower(slotArts)
    Object.keys(smin).forEach(sk => {
      statsMin[sk] = smin[sk] + (statsMin[sk] ?? 0)
      statsMax[sk] = smax[sk] + (statsMax[sk] ?? 0)
    })
  })
  return { statsMin, statsMax }
}

export function reduceFormula(f: NumNode[], lower: DynStat, upper: DynStat) {
  const fixedStats = Object.keys(lower).filter(statKey => lower[statKey] === upper[statKey])
  let f2 = mapFormulas(f, n => n, n => {
    if (n.operation === 'read' && fixedStats.includes(n.path[1])) return constant(lower[n.path[1]])
    if (n.operation === 'threshold') {
      const [branch, branchVal, ge, lt] = n.operands
      if (branch.operation === 'read' && branchVal.operation === 'const') {
        if (lower[branch.path[1]] >= branchVal.value) return n.operands[2]
        if (upper[branch.path[1]] < branchVal.value) return n.operands[3]
      }
    }
    return n
  })

  return optimize(f2, {})
}

function estimateMaximumOnce(func: NumNode, a: ArtifactsBySlot, { statsMin, statsMax }: { statsMin: DynStat, statsMax: DynStat }): { maxEst: number, lin: LinearForm } {
  // const { statsMin, statsMax } = statsUpperLower(a)

  if (func.operation === 'const') {
    return { maxEst: func.value, lin: toLinearUpperBound(func, statsMin, statsMax) as LinearForm }
  }
  if (func.operation === 'read') {
    return { maxEst: statsMax[func.path[1]], lin: toLinearUpperBound(func, statsMin, statsMax) as LinearForm }
  }

  function isVariable(n: NumNode) {
    switch (n.operation) {
      case 'read': case 'max': case 'min': case 'sum_frac': case 'threshold': return true
      default: return false
    }
  }

  let expandedFunc = expandPoly(func, isVariable)
  let products = (expandedFunc.operands as NumNode[]).filter(productPossible)
  let linUBs = products.flatMap(n => toLinearUpperBound(n, statsMin, statsMax))

  let linUBtot = linUBs.reduce((pv, lin) => {
    Object.entries(lin.w).forEach(([k, v]) => pv.w[k] = v + (pv.w[k] ?? 0))
    return { w: pv.w, c: pv.c + lin.c, err: pv.err + lin.err }
  }, { w: {}, c: 0, err: 0 })

  return { maxEst: maxWeight(a, linUBtot), lin: linUBtot }
}

/**
 * Estimates maximum value across an array of formulas
 * @param f              Functions to maximize
 * @param a              Artifact set
 * @param cachedCompute  Optional Prior cached compute. If specified, will re-calculate `maxEst` assuming `lin, lower, upper` are correct.
 * @returns              CachedCompute
 */
type MaxEstQuery = { f: NumNode[], a: ArtifactsBySlot, cachedCompute: { lower: DynStat, upper: DynStat } }
  | { f?: undefined, cachedCompute: { lin: LinearForm[], lower: DynStat, upper: DynStat }, a: ArtifactsBySlot }
export function estimateMaximum({ f, a, cachedCompute }: MaxEstQuery) {
  // function estimateMaximum(f: NumNode[], a: ArtifactsBySlot, cachedCompute?: CachedCompute) {
  if (f !== undefined) {
    const { lower, upper } = cachedCompute
    // const { statsMin, statsMax } = statsUpperLower(a)
    const est = f.map(fi => estimateMaximumOnce(fi, a, { statsMin: lower, statsMax: upper }))

    return {
      maxEst: est.map(({ maxEst }) => maxEst),
      lin: est.map(({ lin }) => lin),
      lower, upper
    }
  }

  let { lin, lower, upper } = cachedCompute
  return {
    maxEst: lin.map(l => maxWeight(a, l)),
    lin, lower, upper
  }
}

export function fillBuffer(stats: DynStat, mapping: Dict<string, number>, buffer: Float64Array) {
  Object.entries(stats)
    .filter(([k]) => mapping[k] !== undefined)
    .forEach(([k, v]) => buffer[mapping[k]!] = v)
}
