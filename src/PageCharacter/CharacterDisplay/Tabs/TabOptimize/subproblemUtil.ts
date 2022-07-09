import { fillBuffer, reducePolynomial } from "../../../../Formula/addedUtils"
import { ExpandedPolynomial, expandPoly, toNumNode } from "../../../../Formula/expandPoly"
import { LinearForm, minMaxWeightVec, toLinearUpperBound } from "../../../../Formula/linearUpperBound"
import { precompute } from "../../../../Formula/optimization"
import { NumNode } from "../../../../Formula/type"
import { allArtifactSets, allSlotKeys, ArtifactSetKey, SlotKey } from "../../../../Types/consts"
import { objectKeyMap, objectKeyValueMap, range } from "../../../../Util/Util"
import { ArtSetExclusion } from "./BuildSetting"
import { ArtifactBuildDataVecDense, ArtifactsBySlot, ArtifactsBySlotVec, DynStat, filterArtsVec2, RequestFilter } from "./common"

export type UnionFilter = {
  uType: true
  filters: StrictDict<SlotKey, { kind: "id", ids: Set<string> }>[]
} | (RequestFilter & { uType: false })

export type RequestFilter2 = {
  // filter: StrictDict<SlotKey, { kind: "id", ids: Set<string> }>,
  filterVec: StrictDict<SlotKey, number[]>,  // dict of list of indices (for some particular ArtifactsBySetVec)
  lower: number[],  // length `k` list of lower bound stats
  upper: number[],  // length `k` list of upper bound stats
  minw: number[],   // length `l` list of minimum upper bound estimates
  maxw: number[],   // length `l` list of maximum upper bound weights
}
export type UnionFilter2 = RequestFilter2[]
export type ArtSetExclusionFull = Dict<Exclude<ArtifactSetKey, "PrayersForDestiny" | "PrayersForIllumination" | "PrayersForWisdom" | "PrayersToSpringtime"> | "uniqueKey", number[]>
// export type SubProblem = SubProblemNC | SubProblemWC
export type SubProblem = SubProblemWC
export type SubProblemNC = {
  cache: false,
  optimizationTarget: ExpandedPolynomial,
  constraints: { value: ExpandedPolynomial, min: number }[],
  artSetExclusion: ArtSetExclusionFull,

  filters: UnionFilter2,
  depth: number,
}
export type SubProblemWC = {
  cache: true,
  optimizationTarget: ExpandedPolynomial,
  constraints: { value: ExpandedPolynomial, min: number }[],
  artSetExclusion: ArtSetExclusionFull,

  filters: UnionFilter2,
  lin: LinearForm[],
  // cachedCompute: CachedCompute,
  depth: number,
}
export type CachedCompute = {
  maxEst: number[],
  lin: LinearForm[],
  lower: DynStat,
  upper: DynStat
}

export function countBuildsU(f: UnionFilter2): number {
  return f.reduce((tot, { filterVec }) => tot + allSlotKeys.reduce((_count, slot) => _count * filterVec[slot].length, 1), 0)
}

export function unionFilterUpperLower(f: UnionFilter2) {
  const lower = [...f[0].lower]
  const upper = [...f[0].upper]
  const minw = [...f[0].minw]
  const maxw = [...f[0].maxw]

  for (let i = 1; i < f.length; i++) {
    for (let j = 0; j < lower.length; j++) {
      lower[j] = Math.min(lower[j], f[i].lower[j])
      upper[j] = Math.max(upper[j], f[i].upper[j])
    }
    for (let j = 0; j < minw.length; j++) {
      minw[j] = Math.min(minw[j], f[i].minw[j])
      maxw[j] = Math.max(maxw[j], f[i].maxw[j])
    }
  }

  return { lower, upper, minw, maxw }
}

export function applyLinearForm(arts: ArtifactsBySlotVec, lin: LinearForm[]) {
  const wixs: number[][] = []
  const ws: number[][] = []
  const baseC: number[] = []
  lin.forEach(li => {
    const ixs0: number[] = []
    const w0: number[] = []
    Object.entries(li.w).forEach(([k, w]) => {
      ixs0.push(arts.keys.indexOf(k))
      w0.push(w)
    })
    wixs.push(ixs0)
    ws.push(w0)

    baseC.push(ixs0.reduce((accum, ix, i) => accum + arts.base[ix] * w0[i], li.c))
  })

  arts.baseBuffer = baseC
  allSlotKeys.forEach(slotKey => arts.values[slotKey].forEach(art =>
    art.buffer = wixs.map((ixsi, i) => ixsi.reduce((accum, ix, j) => accum + art.values[ix] * ws[i][j], 0))
  ))
}

export function reduceSubProblem(arts: ArtifactsBySlotVec, threshold: number, subp: SubProblem): SubProblemWC | undefined {
  const { optimizationTarget, constraints, artSetExclusion, depth } = subp
  let { filters } = subp
  let nodes = [...constraints.map(({ value }) => value), optimizationTarget]
  const mins = constraints.map(({ min }) => min)

  // 0. Check for never-feasible constraints
  filters = filters.filter(({ maxw }) => {
    if (mins.some((min, j) => maxw[j] < min)) return false
    if (maxw[mins.length] < threshold) return false
    return true
  })
  if (filters.length === 0) return undefined

  // 0b. Calculate stat bounding box
  const { lower, upper } = unionFilterUpperLower(filters)
  const statsMin: DynStat = Object.fromEntries(arts.keys.map((k, i) => ([k, lower[i]])))
  const statsMax: DynStat = Object.fromEntries(arts.keys.map((k, i) => ([k, upper[i]])))

  nodes = reducePolynomial(nodes, statsMin, statsMax)

  // 1. Check for always-feasible constraints.
  const [compute, mapping, buffer] = precompute(constraints.map(({ value }) => toNumNode(value)), n => n.path[1])
  fillBuffer(statsMin, mapping, buffer)
  const result = compute()
  const active = mins.map((m, i) => m > result[i])

  const newOptTarget = nodes.pop()!
  const newConstraints = nodes.map((value, i) => ({ value, min: mins[i] })).filter((_, i) => active[i])
  const newMins = newConstraints.map(({ min }) => min)

  // 2. Check for never-active and always-active ArtSetExcl constraints.
  const newArtExcl = {} as ArtSetExclusionFull
  for (const [setKey, exclude] of Object.entries(artSetExclusion)) {
    if (setKey === 'uniqueKey') {
      // TODO: Check and exclude rainbow bullshit.
      newArtExcl[setKey] = exclude
      const feasibleKeys = allArtifactSets.filter(setKey => statsMax[setKey] > 0)
      let feasible4sets = 0
      let feasible2sets = 0
      feasibleKeys.forEach(k => {
        let allowedCnts = range(statsMin[k], statsMax[k])
        if (artSetExclusion[k])
          allowedCnts = allowedCnts.filter(cnt => !artSetExclusion[k].includes(cnt))

        if (allowedCnts.includes(4) || allowedCnts.includes(5)) feasible4sets++
        if (allowedCnts.includes(2) || allowedCnts.includes(3)) feasible2sets++
      })

      if (exclude.includes(5) && feasible4sets === 0) {
        if (feasible2sets === 0) return; // No feasible 4sets or 2sets along with rainbow5 excluded is never satisfiable
        if (exclude.includes(3) && feasible2sets < 2) return; // No 4sets, rainbow5 excluded, rainbow3 excluded means we need at least 2 2sets
      }
      continue
    }
    const reducedExcl = exclude.filter(n => statsMin[setKey] <= n && n <= statsMax[setKey])        // Cut away never-active
    if (reducedExcl.includes(statsMin[setKey]) && reducedExcl.includes(statsMax[setKey])) return;  // Always active.
    if (reducedExcl.length > 0) newArtExcl[setKey] = reducedExcl
  }

  // 3. Estimate Upper Bounds and re-check for never-feasible constraints
  let f = [...newConstraints.map(({ value }) => value), newOptTarget]
  const lin = f.map(fi => toLinearUpperBound(fi, statsMin, statsMax))
  applyLinearForm(arts, lin)
  const newFilters = filters
    .map(filter => {
      const { filterVec, lower, upper } = filter
      const a = filterArtsVec2(arts, filter.filterVec)  // CANDIDATE for making this more efficient
      const minww = [...a.baseBuffer]
      const maxww = [...a.baseBuffer]
      allSlotKeys.forEach(slotKey => {
        const { minw, maxw } = slotUpperLowerVecW(a.values[slotKey])
        for (let j = 0; j < minww.length; j++) {
          minww[j] += minw[j]
          maxww[j] += maxw[j]
        }
      })
      return {
        filterVec, lower, upper,
        minw: minww, maxw: maxww,
      }
    })
    .filter(({ maxw }) => {
      if (newMins.some((min, j) => maxw[j] < min)) return false
      if (maxw[mins.length] < threshold) return false
      return true
    })

  return {
    cache: true,
    optimizationTarget: newOptTarget,
    constraints: newConstraints,
    artSetExclusion: newArtExcl,

    depth, lin, filters: newFilters
  }
}

export function toArtifactBySlotVec(arts: ArtifactsBySlot): ArtifactsBySlotVec {
  const allKeys = new Set(Object.keys(arts.base))
  Object.values(arts.values).forEach(slotArts => {
    slotArts.forEach(art => {
      if (art.set) allKeys.add(art.set)
      Object.keys(art.values).forEach(k => allKeys.add(k))
    })
  })

  const allKeysList = [...allKeys]
  const keys = [...allKeysList.filter(k => !(allArtifactSets as readonly string[]).includes(k)), ...allKeysList.filter(k => (allArtifactSets as readonly string[]).includes(k))]

  return {
    keys, baseBuffer: [],
    base: keys.map(k => arts.base[k] ?? 0),
    values: {
      flower: arts.values.flower.map(({ id, set, values }) => ({ id, set, values: keys.map(k => values[k] ?? (k === set ? 1 : 0)), buffer: [] })),
      plume: arts.values.plume.map(({ id, set, values }) => ({ id, set, values: keys.map(k => values[k] ?? (k === set ? 1 : 0)), buffer: [] })),
      sands: arts.values.sands.map(({ id, set, values }) => ({ id, set, values: keys.map(k => values[k] ?? (k === set ? 1 : 0)), buffer: [] })),
      goblet: arts.values.goblet.map(({ id, set, values }) => ({ id, set, values: keys.map(k => values[k] ?? (k === set ? 1 : 0)), buffer: [] })),
      circlet: arts.values.circlet.map(({ id, set, values }) => ({ id, set, values: keys.map(k => values[k] ?? (k === set ? 1 : 0)), buffer: [] })),
    }
  }
}

type ProblemSetup = {
  optimizationTargetNode: NumNode,
  nodes: NumNode[],
  minimum: number[],
  artSetExclusion: ArtSetExclusion
}
export function problemSetup(arts: ArtifactsBySlotVec, { optimizationTargetNode, nodes, minimum, artSetExclusion }: ProblemSetup): SubProblemWC {
  const artSetExclFull = objectKeyValueMap(Object.entries(artSetExclusion), ([setKey, v]) => {
    if (setKey === 'rainbow') return ['uniqueKey', v.map(v => v + 1)]
    return [setKey, v.flatMap(v => (v === 2) ? [2, 3] : [4, 5])]
  })

  const constraintsEP = nodes
    .map((value, i) => ({ value: expandPoly(value), min: minimum[i] }))
    .filter(x => x.min > -Infinity)
  const opttargetEP = expandPoly(optimizationTargetNode)

  const { lower, upper } = statsUpperLowerVec(arts)
  const statsMin = Object.fromEntries(arts.keys.map((k, i) => [k, lower[i]]))
  const statsMax = Object.fromEntries(arts.keys.map((k, i) => [k, upper[i]]))
  let f = [...constraintsEP.map(({ value }) => value), opttargetEP]
  const lin = f.map(fi => toLinearUpperBound(fi, statsMin, statsMax))
  const minMaxEst = lin.map(li => minMaxWeightVec(arts, li))

  console.log('-----------------------------------------------------------------------')
  console.log('lin', lin)
  console.log('-----------------------------------------------------------------------')

  const filterVec = objectKeyMap(allSlotKeys, slotKey => {
    return arts.values[slotKey].map((v, i) => i)
  })

  const initialProblem: SubProblemWC = {
    cache: true,
    optimizationTarget: opttargetEP,
    constraints: constraintsEP,
    artSetExclusion: artSetExclFull,

    filters: [{
      filterVec, lower, upper,
      maxw: minMaxEst.map(({ maxw }) => maxw),
      minw: minMaxEst.map(({ minw }) => minw),
    }],
    depth: 0,
    lin,
  }
  const initialReducedProblem = reduceSubProblem(arts, -Infinity, initialProblem)
  console.log(initialReducedProblem)
  if (initialReducedProblem === undefined)
    return initialProblem
  return initialReducedProblem
}

export function slotUpperLowerVec(arts: ArtifactBuildDataVecDense[]) {
  const lower = [...arts[0].values]
  const upper = [...arts[0].values]
  const minw = [...arts[0].buffer]
  const maxw = [...arts[0].buffer]
  for (let i = 1; i < arts.length; i++) {
    for (let j = 0; j < lower.length; j++) {
      lower[j] = Math.min(lower[j], arts[i].values[j])
      upper[j] = Math.max(upper[j], arts[i].values[j])
    }
    for (let j = 0; j < minw.length; j++) {
      minw[j] = Math.min(minw[j], arts[i].buffer[j])
      maxw[j] = Math.max(maxw[j], arts[i].buffer[j])
    }
  }
  return { lower, upper, minw, maxw }
}
export function slotUpperLowerVecW(arts: ArtifactBuildDataVecDense[]) {
  const minw = [...arts[0].buffer]
  const maxw = [...arts[0].buffer]
  for (let i = 1; i < arts.length; i++) {
    for (let j = 0; j < minw.length; j++) {
      minw[j] = Math.min(minw[j], arts[i].buffer[j])
      maxw[j] = Math.max(maxw[j], arts[i].buffer[j])
    }
  }
  return { minw, maxw }
}
export function statsUpperLowerVec(a: ArtifactsBySlotVec) {
  const lower = [...a.base]
  const upper = [...a.base]
  const minw = [...a.baseBuffer]
  const maxw = [...a.baseBuffer]
  Object.values(a.values).forEach(slotArts => {
    const slotUL = slotUpperLowerVec(slotArts)
    for (let i = 0; i < lower.length; i++) {
      lower[i] += slotUL.lower[i]
      upper[i] += slotUL.upper[i]
    }
    for (let i = 0; i < minw.length; i++) {
      minw[i] += slotUL.minw[i]
      maxw[i] += slotUL.maxw[i]
    }
  })
  return { lower, upper, minw, maxw }
}
export function statsUpperLowerVecW(a: ArtifactsBySlotVec) {
  const minw = [...a.baseBuffer]
  const maxw = [...a.baseBuffer]
  Object.values(a.values).forEach(slotArts => {
    const slotUL = slotUpperLowerVecW(slotArts)
    for (let i = 0; i < minw.length; i++) {
      minw[i] += slotUL.minw[i]
      maxw[i] += slotUL.maxw[i]
    }
  })
  return { minw, maxw }
}
