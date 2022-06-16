import { constant, prod, cmp, sum } from "./utils"
import { NumNode } from "./type"
import { ArtifactBuildData, ArtifactsBySlot, countBuilds, DynStat, filterArts, RequestFilter } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { toLinearUpperBound, LinearForm } from './linearUpperBound'
import { precompute, optimize } from "./optimization"
import { expandPoly, productPossible } from './expandPoly'
import { mapFormulas } from "./internal"
import { PriorityQueue } from './priorityQueue'
import { cartesian, objectKeyMap } from '../Util/Util'
import { allArtifactSets, allSlotKeys, ArtifactSetKey, SlotKey } from "../Types/consts"

/**
 * @param a  Artifact set
 * @returns  Minimum and maximum of each stat value
 */
function statsUpperLower(a: ArtifactsBySlot) {
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

/**
 * From a linear form f(x), find the maximum value of f(x) on the artifact set `a`
 * @param a    Artifact set
 * @param lin  Linear form to maximize
 * @returns    Maximum value
 */
function maxWeight(a: ArtifactsBySlot, lin: LinearForm) {
  const baseVal = Object.entries(lin.w).reduce((dotProd, [statKey, w]) => dotProd + w * a.base[statKey], lin.c)
  const maxTot = Object.entries(a.values).reduce((maxTotVal, [slotKey, slotArts]) => {
    const maxSlot = slotArts.reduce((maxArt, art) => {
      const artVal = Object.entries(lin.w).reduce((dotProd, [statkey, w]) => dotProd + w * art.values[statkey], 0)
      return maxArt.v > artVal ? maxArt : { v: artVal, id: art.id }
    }, { v: 0, id: '' })
    maxTotVal.v += maxSlot.v
    maxTotVal.ids.push(maxSlot.id)
    return maxTotVal
  }, { v: baseVal, ids: [] as string[] })
  return maxTot.v
}

/**
 * Finds an upper bound on a function for a set of artifacts.
 * @param func Function to maximize
 * @param a    Artifact set
 * @returns    Estimated maximum
 */
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
type MaxEstQuery = { f: NumNode[], a: ArtifactsBySlot, cachedCompute?: undefined } | { f?: undefined, cachedCompute: CachedCompute, a: ArtifactsBySlot }
function estimateMaximum({ f, a, cachedCompute }: MaxEstQuery) {
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

function pickBranch(a: ArtifactsBySlot, cachedCompute: CachedCompute) {
  // TODO: fix this to account for other constraints & maybe set key stuff
  let linToConsider = cachedCompute.lin[0]
  let keysToConsider = Object.keys(linToConsider.w)

  let shatterOn = { k: '', heur: -1 }
  keysToConsider.forEach(k => {
    const postShatterRangeReduction = Object.entries(a.values).reduce((rangeReduc, [slot, arts]) => {
      const vals = arts.map(a => a.values[k])
      const minv = Math.min(...vals)
      const maxv = Math.max(...vals)
      if (minv === maxv) return rangeReduc

      const branchVal = (minv + maxv) / 2
      const glb = Math.max(...vals.filter(v => v <= branchVal))
      const lub = Math.min(...vals.filter(v => v > branchVal))
      return rangeReduc + Math.min(maxv - glb, lub - minv)
    }, 0)
    const heur = linToConsider.w[k] * postShatterRangeReduction
    if (heur > shatterOn.heur) shatterOn = { k, heur }
  })

  if (shatterOn.k === '') throw Error('Shatter broke...')
  return shatterOn
}

function reduceFormula(f: NumNode[], lower: DynStat, upper: DynStat) {
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

function cutConstraints(f: NumNode[], min: number[], lower: DynStat) {
  const [compute, mapping, buffer] = precompute(f, n => n.path[1])
  Object.entries(lower).forEach(([k, v]) => buffer[mapping[k] ?? 0] = v)
  const result = compute()
  const active = min.map((m, i) => m > result[i])
  active[active.length - 1] = true  // Always preserve main dmg formula
  return { f: f.filter((_, i) => active[i]), thr: min.filter((__, i) => active[i]) }
}

export type BNBSplitRequest = {
  arts: ArtifactsBySlot,
  filter: RequestFilter,
  nodes: NumNode[],
  min: number[],

  bnbCompute?: BNBCachedCompute,
  depth: number
}
type BNBCachedCompute = {
  f: NumNode[],
  thr: number[],
  // a: ArtifactsBySlot,

  cachedCompute: CachedCompute
}
type CachedCompute = {
  maxEst: number[],
  lin: LinearForm[],
  lower: DynStat,
  upper: DynStat,
}
function splitBNB({ arts, filter, nodes, min, bnbCompute }: BNBSplitRequest): { filter: RequestFilter, bnbCompute: BNBCachedCompute }[] {
  const a = filterArts(arts, filter)

  // 1. check constraints & simplify formula.
  if (bnbCompute === undefined) {
    const { statsMin, statsMax } = statsUpperLower(a)
    nodes = reduceFormula(nodes, statsMin, statsMax)

    // 1a. Cut away always-satisfied constraints
    const { f, thr } = cutConstraints(nodes, min, statsMin)

    // 1b. Check that existing constraints are satisfiable
    const cc: CachedCompute = estimateMaximum({ f, a })
    if (cc.maxEst.some((max, i) => max < min[i])) return []

    bnbCompute = { f, thr: thr, cachedCompute: cc }
  }

  // 2. Pick branching parameter
  const { k } = pickBranch(a, bnbCompute.cachedCompute)
  const branchVals = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    const vals = arts.map(a => a.values[k])
    return [slotKey, (Math.min(...vals) + Math.max(...vals)) / 2]
  }))
  const branchArts = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    const above = arts.filter(art => art.values[k] < branchVals[slotKey] ? true : false)
    const below = arts.filter(art => art.values[k] < branchVals[slotKey] ? false : true)
    return [slotKey, [below, above]]
  }))

  // 3. Perform branching
  let { f, thr, cachedCompute } = bnbCompute
  let results = [] as { numBuilds: number, filter: RequestFilter, bnbCompute: BNBCachedCompute }[]
  cartesian([0, 1], [0, 1], [0, 1], [0, 1], [0, 1]).forEach(([s1, s2, s3, s4, s5]) => {
    let z = {
      base: { ...a.base },
      values: {
        flower: branchArts.flower[s1],
        plume: branchArts.plume[s2],
        sands: branchArts.sands[s3],
        goblet: branchArts.goblet[s4],
        circlet: branchArts.circlet[s5],
      }
    }

    let numBuilds = Object.values(z.values).reduce((tot, arts) => tot * arts.length, 1)
    if (numBuilds === 0) return;

    const { statsMin, statsMax } = statsUpperLower(z)
    let f2 = reduceFormula(f, statsMin, statsMax)

    // Prune if any constraint becomes unsatisfiable (fast)
    let { maxEst } = estimateMaximum({ a: z, cachedCompute })
    if (maxEst.some((max, i) => max < min[i])) return;

    // Prune if any constraint becomes unsatisfiable (slow)
    let est = estimateMaximum({ a: z, f: f2 })
    if (est.maxEst.some((max, i) => max < min[i])) return;

    // console.log(s1, s2, s3, s4, s5, { fastMax: maxEst[0], slowMax: est.maxEst[0] })

    let newFilter = objectKeyMap(allSlotKeys, slot => ({ kind: 'id' as 'id', ids: new Set(z.values[slot].map(art => art.id)) }))
    results.push({
      numBuilds,
      filter: newFilter,
      bnbCompute: {
        f: f2,
        thr: thr,
        cachedCompute: est
      }
    })
  })
  results.sort((a, b) => b.numBuilds - a.numBuilds)
  return results
}

export function debugMe(f: NumNode, arts: ArtifactsBySlot) {
  // debug3(f, arts)

  const noFilter = { kind: "exclude" as const, sets: new Set<ArtifactSetKey>() }
  const noFilter2: RequestFilter = objectKeyMap(allSlotKeys, _ => noFilter)
  // let minVal = -Infinity
  let minVal = 32000
  let jobs = [{ arts, filter: noFilter2, nodes: [f], min: [minVal], depth: 0 }] as BNBSplitRequest[]

  let cnt = 0
  let numEnum = 0
  while (jobs.length > 0) {
    let req = jobs.pop()
    if (req === undefined) break

    if ((req.bnbCompute?.cachedCompute.maxEst[0] ?? Infinity) < minVal) continue

    let { filter, nodes, min, depth } = req
    let numBuilds = countBuilds(filterArts(arts, filter))
    if (numBuilds < 2000) {
      numEnum += numBuilds
      continue
    }

    console.log({ iter: cnt, nb: numBuilds, treesize: jobs.length, depth }, { max: req.bnbCompute?.cachedCompute.maxEst[0] })
    splitBNB(req).forEach(({ filter, bnbCompute }) => jobs.push({ arts, filter, nodes, min, bnbCompute, depth: depth + 1 }))
    // console.log(jobs.length)

    cnt += 1
    if (cnt > 2000) break
  }

  console.log(jobs, cnt, numEnum)
}

function debug3(f: NumNode, arts: ArtifactsBySlot) {
  // const f: NumNode = { "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "GladiatorsFinale"], "accu": "add", "info": { "key": "GladiatorsFinale" }, "type": "number" }, { "operation": "const", "operands": [], "value": 2, "type": "number", }, { "operation": "const", "operands": [], "type": "number", "value": 0.18, "info": { "key": "_" } }, { "operation": "const", "operands": [], "type": "number", "value": 0 }], "info": { "key": "atk_", "source": "GladiatorsFinale" }, "emptyOn": "l" }, { "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "ShimenawasReminiscence"], "accu": "add", "info": { "key": "ShimenawasReminiscence" }, "type": "number" }, { "operation": "const", "operands": [], "type": "number", "value": 2 }, { "operation": "const", "operands": [], "type": "number", "value": 0.18, "info": { "key": "_" } }, { "operation": "const", "operands": [], "type": "number", "value": 0 }], "info": { "key": "atk_", "source": "ShimenawasReminiscence" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "atk_"], "info": { "prefix": "art", "asConst": true, "key": "atk_" }, "type": "number", "accu": "add" }, { "operation": "const", "operands": [], "type": "number", "value": 1.48 }] }, { "operation": "const", "operands": [], "type": "number", "value": 1023.5349814209899 }] }, { "operation": "read", "operands": [], "path": ["dyn", "atk"], "info": { "prefix": "art", "asConst": true, "key": "atk" }, "type": "number", "accu": "add" }] }, { "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "ViridescentVenerer"], "accu": "add", "info": { "key": "ViridescentVenerer" }, "type": "number" }, { "operation": "const", "operands": [], "type": "number", "value": 2 }, { "operation": "const", "operands": [], "type": "number", "value": 0.15, "info": { "key": "_" } }, { "operation": "const", "operands": [], "type": "number", "value": 0 }], "info": { "key": "anemo_dmg_", "variant": "anemo", "source": "ViridescentVenerer" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "anemo_dmg_"], "info": { "prefix": "art", "asConst": true, "key": "anemo_dmg_", "variant": "anemo" }, "type": "number", "accu": "add" }, { "operation": "const", "operands": [], "type": "number", "value": 2.202 }] }, { "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "min", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "Berserker"], "accu": "add", "info": { "key": "Berserker" }, "type": "number" }, { "operation": "const", "operands": [], "type": "number", "value": 2 }, { "operation": "const", "operands": [], "type": "number", "value": 0.12, "info": { "key": "_" } }, { "operation": "const", "operands": [], "type": "number", "value": 0 }], "info": { "key": "critRate_" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "critRate_"], "info": { "prefix": "art", "asConst": true, "key": "critRate_" }, "type": "number", "accu": "add" }, { "operation": "const", "operands": [], "type": "number", "value": 0.32200000166893006 }] }, { "operation": "const", "operands": [], "type": "number", "value": 1 }] }, { "operation": "read", "operands": [], "path": ["dyn", "0"], "type": "number", "accu": "add" }] }, { "operation": "const", "operands": [], "type": "number", "value": 1 }] }, { "operation": "const", "operands": [], "type": "number", "value": 1.8180805500000001 }] }
  const filter: RequestFilter = {
    "flower": {
      "kind": "id",
      "ids": new Set(["artifact_1298"])
    },
    "plume": {
      "kind": "id",
      "ids": new Set(["artifact_893", "artifact_1211", "artifact_1363", "artifact_1087", "artifact_717", "artifact_1226", "artifact_1257", "artifact_1158", "artifact_473", "artifact_81", "artifact_194", "artifact_1413", "artifact_195", "artifact_95", "artifact_270", "artifact_1163", "artifact_1366", "artifact_843", "artifact_696", "artifact_265", "artifact_317", "artifact_760", "artifact_739", "artifact_456", "artifact_1012", "artifact_1244", "artifact_758", "artifact_498", "artifact_70", "artifact_790", "artifact_930", "artifact_154", "artifact_1195", "artifact_1452", "artifact_1449", "artifact_401", "artifact_1438", "artifact_307", "artifact_1326", "artifact_602"]),
    },
    "sands": {
      "kind": "id",
      "ids": new Set(["artifact_1161", "artifact_1272", "artifact_575"])
    },
    "goblet": {
      "kind": "id",
      "ids": new Set(["artifact_1033"])
    },
    "circlet": {
      "kind": "id",
      "ids": new Set(["artifact_799"])
    }
  }

  const a = filterArts(arts, filter)
  const { statsMin, statsMax } = statsUpperLower(a)
  let f2 = reduceFormula([f], statsMin, statsMax)
  console.log('lower', statsMin)
  console.log('upper', statsMax)

  let { maxEst } = estimateMaximum({ f: f2, a })
  // console.log(maxEst)
  const [compute0, mapping0, buffer0] = precompute([f], n => n.path[1])
  const [compute, mapping, buffer] = precompute(f2, n => n.path[1])

  let { maxv: trueMax, build } = cartesian(...Object.values(a.values)).reduce(({ maxv, build }, arts) => {
    Object.entries(mapping).forEach(([k, i]) => buffer[i] = 0)
    Object.entries(a.base).forEach(([k, v]) => buffer[mapping[k] ?? 0] = v)
    arts.forEach(art => {
      Object.entries(art.values).forEach(([k, v]) => buffer[mapping[k] ?? 0] += v)
    })

    const cmp = compute()[0]
    return maxv > cmp ? { maxv, build } : { maxv: cmp, build: arts }
  }, { maxv: 0, build: [] as ArtifactBuildData[] })

  console.log({ trueMax, estMax: maxEst[0] })

  function isVariable(n: NumNode) {
    switch (n.operation) {
      case 'read': case 'max': case 'min': case 'sum_frac': case 'threshold': return true
      default: return false
    }
  }
  let expandedFunc = expandPoly(f2[0], isVariable)
  let products = (expandedFunc.operands as NumNode[]).filter(productPossible)

  // const [compute2, mapping2, buffer2] = precompute(products, n => n.path[1])
  // Object.entries(a.base).forEach(([k, v]) => {
  //   buffer2[mapping2[k] ?? 0] = v
  //   buffer0[mapping0[k] ?? 0] = v
  //   buffer[mapping[k] ?? 0] = v
  // })
  // build.forEach(art => {
  //   Object.entries(art.values).forEach(([k, v]) => {
  //     buffer0[mapping0[k] ?? 0] += v
  //     buffer2[mapping2[k] ?? 0] += v
  //     buffer[mapping[k] ?? 0] += v
  //   })
  // })

  // let actualprods = compute2().slice(0, products.length)
  // console.log({ orig: compute0()[0], reduced: compute()[0], expanded: actualprods.reduce((a, b) => a + b) })

  // let linUBs = products.map(n => toLinearUpperBound(n, statsMin, statsMax))
  // console.log('linUBs', linUBs)
  // let buildstats = build.reduce((stats, { values }) => {
  //   Object.entries(values).forEach(([k, v]) => stats[k] += v)
  //   return stats
  // }, { ...a.base })
  // console.log('using stats:', buildstats)
  // let ubprods = linUBs.map(lin1 => {
  //   let lin2 = [lin1].flat()
  //   return lin2.reduce((sum, lin) => {
  //     return sum + Object.entries(lin.w).reduce((pv, [k, w]) => pv + w * buildstats[k], lin.c)
  //   }, 0)
  // })

  // console.log('actual', actualprods)
  // console.log('upper', ubprods)

  console.log(products[2])
  toLinearUpperBound(products[2], statsMin, statsMax)
}
