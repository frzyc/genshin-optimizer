import { constant, sum, prod, cmp } from "./utils"
import { NumNode } from "./type"
import { allOperations } from "./optimization"
import { mapFormulas } from "./internal"
import { ArtifactBuildData, ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { LinearForm, maxWeight, toLinearUpperBound } from "./linearUpperBound"
import { foldLikeTerms, ExpandedPolynomial } from "./expandPoly"
import { ArtifactSetKey } from "../Types/consts"
import { ArtSetExclusion } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/BuildSetting"

export function foldSum(nodes: readonly NumNode[]) {
  if (nodes.length === 1) return nodes[0]
  nodes = nodes.flatMap(n => n.operation === 'add' ? n.operands : n)
  let constVal = nodes.reduce((pv, n) => n.operation === 'const' ? pv + n.value : pv, 0)
  nodes = nodes.filter(n => n.operation !== 'const')

  if (nodes.length === 0) return constant(constVal)
  if (constVal === 0) {
    if (nodes.length === 1) return nodes[0]
    return sum(...nodes)
  }
  return sum(...nodes, constant(constVal))
}

export function foldProd(nodes: readonly NumNode[]) {
  if (nodes.length === 1) return nodes[0]
  nodes = nodes.flatMap(n => n.operation === 'mul' ? n.operands : n)
  let constVal = nodes.reduce((pv, n) => n.operation === 'const' ? pv * n.value : pv, 1)
  nodes = nodes.filter(n => n.operation !== 'const')

  if (nodes.length === 0) return constant(constVal)
  if (constVal === 1) return prod(...nodes)
  return prod(...nodes, constant(constVal))
}

export function slotUpperLower(a: ArtifactBuildData[]) {
  if (a.length === 0) return { statsMin: {}, statsMax: {} }
  // Assume keys are the same for all artifacts.
  const keys = Object.keys(a[0].values)
  let statsMin: DynStat = {}
  let statsMax: DynStat = {}
  let sets = new Set<ArtifactSetKey>()
  keys.forEach(k => {
    statsMin[k] = Infinity
    statsMax[k] = -Infinity
  })
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < keys.length; j++) {
      const k = keys[j]
      statsMin[k] = Math.min(a[i].values[k], statsMin[k])
      statsMax[k] = Math.max(a[i].values[k], statsMax[k])
    }
    if (a[i].set) sets.add(a[i].set!)
  }
  sets.forEach(set => {
    statsMax[set] = 1
    statsMin[set] = 0
  })
  if (sets.size === 1) {
    const [s] = sets
    statsMin[s] = 1
  }
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
    switch (n.operation) {
      case 'add':
        return foldSum(n.operands)
      case 'mul':
        return foldProd(n.operands)

      case 'read':
        if (fixedStats.includes(n.path[1])) return constant(lower[n.path[1]])
        return n
      case 'threshold':
        const [branch, branchVal, ge, lt] = n.operands
        if (branch.operation === 'const' && branchVal.operation === 'const')
          return branch.value >= branchVal.value ? ge : lt
        if (branch.operation === 'read' && branchVal.operation === 'const') {
          if (lower[branch.path[1]] >= branchVal.value) return ge
          if (upper[branch.path[1]] < branchVal.value) return lt
        }
        return n
      case 'min': case 'max':
      case 'res': case 'sum_frac':
        if (n.operands.every(ni => ni.operation === 'const')) {
          const out = allOperations[n.operation](n.operands.map(ni => ni.operation === 'const' ? ni.value : NaN))
          return constant(out)
        }
        return n
      default:
        return n
    }
  })

  // f2 = optimize(f2, {})
  return f2
}

export function reducePolynomial(f: ExpandedPolynomial[], lower: DynStat, upper: DynStat): ExpandedPolynomial[] {
  const fixedStats = Object.keys(lower).filter(statKey => Math.abs(lower[statKey] - upper[statKey]) < 1e-6)
  return f.map(({ nodes, terms }) => {
    // 1. Reduce nodes by substituting constants
    const tagNodePairs = Object.entries(nodes)
    const reducedNodes = mapFormulas(tagNodePairs.map(([k, v]) => v), n => n, n => {
      switch (n.operation) {
        case 'read':
          if (fixedStats.includes(n.path[1])) return constant(lower[n.path[1]])
          return n
        case 'threshold':
          const [branch, branchVal, ge, lt] = n.operands
          if (branch.operation === 'const' && branchVal.operation === 'const')
            return branch.value >= branchVal.value ? ge : lt
          if (branch.operation === 'read' && branchVal.operation === 'const') {
            if (lower[branch.path[1]] >= branchVal.value) return ge
            if (upper[branch.path[1]] < branchVal.value) return lt
          }
          else throw Error('Branch between non-read and non-const!!!')
          return n
        case 'add':
          return foldSum(n.operands)
        case 'mul':
          return foldProd(n.operands)
        case 'res': case 'sum_frac':
          if (n.operands.every(ni => ni.operation === 'const')) {
            const out = allOperations[n.operation](n.operands.map(ni => ni.operation === 'const' ? ni.value : NaN))
            return constant(out)
          }
          return n
        case 'min': case 'max':
          // TODO: reduce min & max
          if (n.operands.every(ni => ni.operation === 'const')) {
            const out = allOperations[n.operation](n.operands.map(ni => ni.operation === 'const' ? ni.value : NaN))
            return constant(out)
          }
          return n
        default:
          return n
      }
    })

    // 2a. Find all the nodes that have been reduced to constants
    let tagsToKill = {} as Dict<string, number>
    reducedNodes.forEach((n, i) => {
      if (n.operation !== 'const') return
      const [tag] = tagNodePairs[i]
      tagsToKill[tag] = n.value
    })

    // 2b. Substitute the constant nodes in where possible
    let newTerms = terms.map(mon => {
      let c = mon.coeff
      const newTerms = mon.terms.filter(t => {
        if (tagsToKill[t] !== undefined) {
          c *= tagsToKill[t]!
          return false
        }
        return true
      })
      if (c === 0) return { coeff: 0, terms: [] }
      return { coeff: c, terms: newTerms }
    })

    // 3. Delete all the constant tags & add like terms together
    let newNodes = Object.fromEntries(reducedNodes.map((n, i) => [tagNodePairs[i][0], n]))
    Object.keys(tagsToKill).forEach(t => delete newNodes[t])
    return { nodes: newNodes, terms: foldLikeTerms(newTerms) }
  })
}

/**
 * Estimates maximum value across an array of formulas
 * @param f              Functions to maximize
 * @param a              Artifact set
 * @param cachedCompute  Optional Prior cached compute. If specified, will re-calculate `maxEst` assuming `lin, lower, upper` are correct.
 * @returns              CachedCompute
 */
type MaxEstQuery2 = { f: ExpandedPolynomial[], a: ArtifactsBySlot, cachedCompute: { lower: DynStat, upper: DynStat } }
  | { f?: undefined, cachedCompute: { lin: LinearForm[], lower: DynStat, upper: DynStat }, a: ArtifactsBySlot }
export function estimateMaximum({ f, a, cachedCompute }: MaxEstQuery2) {
  if (f === undefined) {
    return { maxEst: cachedCompute.lin.map(l => maxWeight(a, l)), ...cachedCompute }
  }

  const { lower, upper } = cachedCompute
  const est = f.map(fi => {
    const lin = toLinearUpperBound(fi, lower, upper)
    return { maxEst: maxWeight(a, lin), lin }
  })

  return {
    maxEst: est.map(({ maxEst }) => maxEst),
    lin: est.map(({ lin }) => lin),
    lower, upper
  }
}

export function fillBuffer(stats: DynStat, mapping: Dict<string, number>, buffer: Float64Array) {
  Object.entries(stats)
    .filter(([k]) => mapping[k] !== undefined)
    .forEach(([k, v]) => buffer[mapping[k]!] = v)
}

export function thresholdExclusions(nodes: NumNode[], excl: ArtSetExclusion) {
  nodes = mapFormulas(nodes, n => n, n => {
    switch (n.operation) {
      case 'threshold':
        const [branch, branchVal, ge, lt] = n.operands
        if (branch.operation === 'read' && branchVal.operation === 'const') {
          const key = branch.path[1] as ArtifactSetKey
          if (excl[key] !== undefined) {
            const exc = excl[key] as (2 | 4)[]
            // Based on exclusion, either return `lt` or shift `branchVal` to 4.
            if (branchVal.value === 2 && exc.includes(2)) {
              if (exc.includes(4)) return lt
              return cmp(branch, 4, ge, lt)
            }
            if (branchVal.value === 4 && exc.includes(4))
              return lt
          }
        }
        return n
      default:
        return n
    }
  })
  return nodes
}
