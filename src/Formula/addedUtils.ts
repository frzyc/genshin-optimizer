import { constant, prod, cmp } from "./utils"
import { NumNode } from "./type"
import { optimize } from "./optimization"
import { mapFormulas } from "./internal"
import { ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { LinearForm, maxWeight, toLinearUpperBound } from "./linearUpperBound"
import { expandPoly, productPossible } from "./expandPoly"

export function statsUpperLower(a: ArtifactsBySlot) {
  let minStats = Object.entries(a.values).reduce((pv, [slotKey, slotArts]) => {
    let minStatSlot: DynStat = {}
    slotArts.forEach(art => {
      for (const statKey in art.values) minStatSlot[statKey] = Math.min(art.values[statKey], minStatSlot[statKey] ?? Infinity)
    })
    Object.entries(minStatSlot).forEach(([k, v]) => pv[k] = v + (pv[k] ?? 0))
    return pv
  }, { ...a.base })
  let maxStats = Object.entries(a.values).reduce((pv, [slotKey, slotArts]) => {
    let maxStatSlot: DynStat = {}
    slotArts.forEach(art => {
      for (const statKey in art.values) maxStatSlot[statKey] = Math.max(art.values[statKey], maxStatSlot[statKey] ?? 0)
    })
    Object.entries(maxStatSlot).forEach(([k, v]) => pv[k] = v + (pv[k] ?? 0))
    return pv
  }, { ...a.base })
  return { statsMin: minStats, statsMax: maxStats }
}

export function reduceFormula(f: NumNode[], lower: DynStat, upper: DynStat) {
  const fixedStats = Object.fromEntries(Object.entries(lower).filter(([statKey, v]) => v === upper[statKey]))
  let f2 = mapFormulas(f, n => n, n => {
    if (n.operation === 'read' && n.path[1] in fixedStats) return constant(fixedStats[n.path[1]])
    if (n.operation === 'threshold') {
      const [branch, branchVal, ge, lt] = n.operands
      if (branch.operation === 'read' && branchVal.operation === 'const') {
        if (lower[branch.path[1]] >= branchVal.value) return n.operands[2]
        if (upper[branch.path[1]] < branchVal.value) return n.operands[3]
      }

      if (ge.operation !== 'const') {
        if (lt.operation === 'const' && lt.value === 0) {
          return prod(cmp(branch, branchVal, 1, 0), ge)
        }
        throw Error('Threshold between non-const `pass` and non-zero `fail` not supported.')
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
type MaxEstQuery = { f: NumNode[], a: ArtifactsBySlot, cachedCompute?: undefined } | { f?: undefined, cachedCompute: { lin: LinearForm[], lower: DynStat, upper: DynStat }, a: ArtifactsBySlot }
export function estimateMaximum({ f, a, cachedCompute }: MaxEstQuery) {
  // function estimateMaximum(f: NumNode[], a: ArtifactsBySlot, cachedCompute?: CachedCompute) {
  if (cachedCompute === undefined) {
    const { statsMin, statsMax } = statsUpperLower(a)
    const est = f.map(fi => estimateMaximumOnce(fi, a, { statsMin, statsMax }))

    return {
      maxEst: est.map(({ maxEst }) => maxEst),
      lin: est.map(({ lin }) => lin),
      lower: statsMin,
      upper: statsMax
    }
  }

  let { lin, lower, upper } = cachedCompute
  return {
    maxEst: lin.map(l => maxWeight(a, l)),
    lin, lower, upper
  }
}
