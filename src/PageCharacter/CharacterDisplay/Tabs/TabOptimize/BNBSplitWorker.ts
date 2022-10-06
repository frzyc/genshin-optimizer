import { forEachNodes, mapContextualFormulas } from "../../../../Formula/internal";
import { allOperations } from "../../../../Formula/optimization";
import { ConstantNode, NumNode, ThresholdNode } from "../../../../Formula/type";
import { customRead, prod, threshold } from "../../../../Formula/utils";
import { SlotKey } from "../../../../Types/consts";
import { assertUnreachable, objectKeyValueMap, objectMap } from "../../../../Util/Util";
import type { InterimResult, Setup, SplitWorker } from "./BackgroundWorker";
import { ArtifactBuildData, ArtifactsBySlot, computeFullArtRange, computeNodeRange, countBuilds, DynStat, filterArts, MinMax, pruneAll, RequestFilter } from "./common";

type Approximation = {
  base: number,
  /** optimization target contribution from a given artifact (id) */
  conts: StrictDict<string, number>
}
type Filter = {
  nodes: NumNode[], arts: ArtifactsBySlot
  /**
   * The contribution of each artifact to the optimization target. The (over)estimated
   * optimization target value is the sum of contributions of all artifacts in the build.
   */
  approxs: Approximation[], maxConts: Record<SlotKey, number>[]
  /** How many times has this filter been splitted */
  age: number
  /** Total number of builds in this filter */
  count: number
  /** Whether or not this filter is in a valid (calculated) state */
  calculated?: boolean
}
export class BNBSplitWorker implements SplitWorker {
  id: number
  min: number[]
  nodes: NumNode[]
  arts: ArtifactsBySlot
  maxBuilds: number

  /**
   * Filters are not neccessarily in a valid state, i.e., "calculated".
   * We amortize the calculation to 1-per-split so that the calculation
   * overhead doesn't lead to lag.
   */
  filters: Filter[] = []
  interim: InterimResult | undefined
  firstUncalculated = 0

  callback: (interim: InterimResult) => void

  constructor({ id, arts, optimizationTarget, filters, maxBuilds }: Setup, callback: (interim: InterimResult) => void) {
    this.id = id
    this.arts = arts
    this.min = [-Infinity, ...filters.map(x => x.min)]
    this.nodes = [optimizationTarget, ...filters.map(x => x.value)]
    this.callback = callback
    this.maxBuilds = maxBuilds

    // make sure we can approximate it
    linearUpperBound(this.nodes, arts)
  }

  addFilter(filter: RequestFilter): void {
    const arts = filterArts(this.arts, filter), count = countBuilds(arts)
    if (count)
      this.filters.push({ nodes: this.nodes, arts, maxConts: [], approxs: [], age: 0, count })
  }
  split(newThreshold: number, minCount: number): RequestFilter | undefined {
    if (newThreshold > this.min[0]) {
      this.min[0] = newThreshold
      // All calculations become stale
      this.firstUncalculated = 0
      this.filters.forEach(filter => delete filter.calculated)
    }
    if (this.firstUncalculated < this.filters.length)
      this.calculateFilter(this.firstUncalculated++) // Amortize the filter calculation to 1-per-split

    while (this.filters.length) {
      const filter = this.getApproxFilter(), { arts, count } = filter
      if (!count) continue

      if (count <= minCount) {
        if (this.interim) {
          this.callback(this.interim)
          this.interim = undefined
        }
        return objectMap(arts.values, arts => ({ kind: "id" as const, ids: new Set(arts.map(art => art.id)) }))
      }
      this.splitOldFilter(filter)
    }
    if (this.interim) {
      this.callback(this.interim)
      this.interim = undefined
    }
    return undefined
  }

  splitOldFilter({ nodes, arts, approxs, age }: Filter) {
    /**
     * Split the artifacts in each slot into high/low main (index 0) contribution along 1/3 of the
     * contribution range. If the main contribution of a slot is in range 500-2000, the the high-
     * contibution artifact has contribution of at least 1500, and the rest are low-contribution.
     */
    const splitted = objectMap(arts.values, arts => {
      const remaining = arts.map((art) => ({ art, cont: approxs[0].conts[art.id] }))
        .sort(({ cont: c1 }, { cont: c2 }) => c2 - c1)
      const minCont = remaining[remaining.length - 1]?.cont ?? 0
      let contCutoff = remaining.reduce((accu, { cont }) => accu + cont, -minCont * remaining.length) / 3

      const index = Math.max(1, remaining.findIndex(({ cont }) => (contCutoff -= cont - minCont) <= 0))
      const lowArts = remaining.splice(index).map(({ art }) => art), highArts = remaining.map(({ art }) => art)
      return {
        high: { arts: highArts, maxConts: approxs.map(approx => maxContribution(highArts, approx)), },
        low: { arts: lowArts, maxConts: approxs.map(approx => maxContribution(lowArts, approx)) },
      }
    })
    const remaining = Object.keys(splitted), { filters } = this
    const current: StrictDict<SlotKey, ArtifactBuildData[]> = {} as any
    const currentCont: StrictDict<SlotKey, number[]> = {} as any
    function partialSplit(count: number) {
      if (!remaining.length) {
        const maxConts = approxs.map((_, i) => objectMap(currentCont, val => val[i]))
        const currentArts = { base: arts.base, values: { ...current } }
        filters.push({ nodes, arts: currentArts, maxConts, approxs, age: age + 1, count })
        return
      }
      const slot = remaining.pop()!, { high, low } = splitted[slot]
      if (low.arts.length) {
        current[slot] = low.arts
        currentCont[slot] = low.maxConts
        partialSplit(count * low.arts.length)
      }
      if (high.arts.length) {
        current[slot] = high.arts
        currentCont[slot] = high.maxConts
        partialSplit(count * high.arts.length)
      }
      remaining.push(slot)
    }
    partialSplit(1)
  }

  /** *Precondition*: `this.filters` must not be empty */
  getApproxFilter(): Filter {
    this.calculateFilter(this.filters.length - 1)
    if (this.firstUncalculated > this.filters.length)
      this.firstUncalculated = this.filters.length
    return this.filters.pop()!
  }
  /** Update calculate on filter at index `i` if not done so already */
  calculateFilter(i: number): void {
    let { nodes, arts, maxConts, approxs, age, count: oldCount, calculated } = this.filters[i]
    if (calculated) return
    if (!age || (age % 5) === 1) { // Make sure the condition includes initial filter `age === 0`
      // Either the filter is so early that we can get a good cutoff, or the problem has
      // gotten small enough that the old approximation becomes inaccurate
      ({ nodes, arts } = pruneAll(nodes, this.min, arts, this.maxBuilds, {}, { pruneNodeRange: true }))
      if (Object.values(arts.values).every(x => x.length)) {
        approxs = approximation(nodes, arts)
        maxConts = approxs.map(approx => objectMap(arts.values, val => maxContribution(val, approx)))
        console.log(Object.values(maxConts[0]).reduce((a, b) => a + b, approxs[0].base), this.min[0])
      }
    }
    // Removing artifacts that doesn't meet the required opt target contributions.
    //
    // We could actually loop `newValues` computation if the removed artifacts have
    // the highest contribution in one of the target node as the removal will lower
    // the required contribution even further. However, once is generally enough.
    const newValues = objectMap(arts.values, (arts, slot) => {
      const requiredConts = maxConts.map((cont, i) => Object.values(cont)
        .reduce((accu, val) => accu - val, this.min[i] - approxs[i].base + cont[slot]))
      return arts.filter(({ id }) => approxs.every(({ conts }, i) => conts[id] > requiredConts[i]))
    })
    arts = { base: arts.base, values: newValues }
    const newCount = countBuilds(arts)
    if (newCount !== oldCount)
      if (this.interim) this.interim.skipped += oldCount - newCount
      else this.interim = { command: "interim", buildValues: undefined, tested: 0, failed: 0, skipped: oldCount - newCount }
    this.filters[i] = { nodes, arts, maxConts, approxs, age, count: newCount, calculated: true }
  }
}

function maxContribution(arts: ArtifactBuildData[], approximation: Approximation): number {
  return Math.max(...arts.map(({ id }) => approximation.conts[id]!))
}
function approximation(nodes: NumNode[], arts: ArtifactsBySlot): Approximation[] {
  return linearUpperBound(nodes, arts).map(weight => ({
    base: dot(arts.base, weight, weight.$c),
    conts: objectKeyValueMap(Object.values(arts.values).flat(),
      data => [data.id, dot(data.values, weight, 0)])
  }))
}

function dot(values: DynStat, lin: DynStat, c: number): number {
  return Object.entries(values).reduce((accu, [k, v]) => accu + (lin[k] ?? 0) * v, c)
}

function weightedSum(...entries: readonly (readonly [number, Linear])[]): Linear
function weightedSum(...entries: readonly (readonly [number, DynStat])[]): DynStat
function weightedSum(...entries: readonly (readonly [number, DynStat])[]): DynStat {
  const result = {}
  for (const [weight, entry] of entries)
    for (const [k, v] of Object.entries(entry))
      result[k] = (result[k] ?? 0) + weight * v
  return result
}
type Linear = DynStat & { $c: number }
/** Compute a linear upper bound of `nodes` */
function linearUpperBound(nodes: NumNode[], arts: ArtifactsBySlot): Linear[] {
  const cents = weightedSum([1, arts.base], ...Object.values(arts.values).map(arts =>
    [1 / arts.length, weightedSum(...arts.map(art => [1, art.values] as const))] as const))
  const getCent = (lin: Linear) => dot(cents, lin, lin.$c)

  const ranges = new Map<Linear, MinMax>(), range1D = new Map<string, MinMax>()
  function getRange(lin: Linear): MinMax {
    const old = ranges.get(lin)
    if (old) return old
    if ((Object.keys(lin).length <= 2)) {
      const keys = Object.keys(lin).filter(key => key !== "$c")
      const range = { min: lin.$c, max: lin.$c }
      if (keys.length) {
        const [key] = keys, weight = lin[key]
        const { min, max } = range1D.get(key)!
        if (weight > 0) {
          range.min += min * weight
          range.max += max * weight
        } else {
          range.min += max * weight
          range.max += min * weight
        }
      }
      ranges.set(lin, range)
      return range
    }
    let min = dot(arts.base, lin, lin.$c), max = min
    Object.values(arts.values).forEach(arts => {
      const values = arts.map(art => dot(lin, art.values, 0))
      min += Math.min(...values)
      max += Math.max(...values)
    })
    const result = { min, max }
    ranges.set(lin, result)
    return result
  }

  const negativeNodes = new Set<NumNode>()
  {
    // Only check for negativity on a few relevant nodes
    const checking: NumNode[] = []
    forEachNodes([...nodes, ...Object.keys(arts.base).map(key => customRead(["dyn", key]))], f => {
      const { operation } = f
      switch (operation) {
        case "mul": checking.push(f, ...f.operands)
      }
    }, _ => _)
    const nodeRanges = computeNodeRange(checking, computeFullArtRange(arts))
    nodeRanges.forEach((range, node) => {
      if (range.min < 0) negativeNodes.add(node)
      if (node.operation === "read") range1D.set(node.path[1], range)
    })
  }

  function slopePoint(slope: number, x: number, y: number, v: Linear): Linear {
    return weightedSum([1, { $c: y - slope * x }], [slope, v])
  }
  function interpolate(x0: number, y0: number, x1: number, y1: number, v: Linear): Linear | undefined {
    if (Math.abs(x1 - x0) < 1e-10) return undefined
    return slopePoint((y1 - y0) / (x1 - x0), x0, y0, v)
  }
  const upper = new Map<NumNode, Linear>(), lower = new Map<NumNode, Linear>()
  const inward = new Map<NumNode, Linear>(), outward = new Map<NumNode, Linear>()
  nodes = mapContextualFormulas(nodes, upper, (_f, context) => {
    let f = _f as NumNode, { operation } = f
    switch (context) {
      case inward: return [f, negativeNodes.has(f) ? upper : lower]
      case outward: return [f, negativeNodes.has(f) ? lower : upper]
    }
    if (f.operation === "threshold") {
      const [v, t, pOp, fOp] = f.operands
      if (pOp.operation !== "const") {
        if (fOp.operation !== "const" || fOp.value !== 0)
          throw new PolyError("Unsupported pattern", operation)
        f = prod(threshold(v, t, 1, fOp), pOp)
      }
    }
    operation = f.operation
    switch (operation) {
      case "const": case "read": case "add": case "min": case "max":
      case "sum_frac":
        return [f, context]
      case "mul": {
        let c = 1
        const flatten = (node: NumNode): NumNode[] => node.operation === "mul" ? node.operands.flatMap(flatten) : [node]
        const operands = flatten(f).filter(op => op.operation === "const" ? (c *= op.value, false) : true)
        if ((context === upper) !== (c > 0))
          throw new PolyError("Inward bound request", operation)
        return [prod(c, ...operands), outward]
      }
      case "res": {
        if (context === lower)
          throw new PolyError("Lower bound request", operation)
        return [f, lower]
      }
      case "threshold": {
        const [t, pOp, fOp] = (f as ThresholdNode<NumNode>).operands.slice(1)
        if (pOp.operation !== "const" || fOp.operation !== "const" || t.operation !== "const")
          throw new PolyError("Unsupported pattern", operation)

        const pass = pOp.value, fail = fOp.value
        const minHalf = (pass > fail) === (context === upper)
        return [f, minHalf ? upper : lower]
      }

      case "data": case "match": case "lookup": case "subscript":
        throw new PolyError("Unsupported operation", operation)
      default: assertUnreachable(operation)
    }
  }, (_f, _orig, context, parentContext) => {
    const f = _f as NumNode, { operation } = f

    let result: Linear
    switch (operation) {
      case "const": result = { $c: f.value }; break
      case "read": result = { [f.path[1]]: 1, $c: 0 }; break
      case "add": result = weightedSum(...f.operands.map(op => [1, context.get(op)!] as const)); break
      case "mul": {
        if (context !== outward) throw new PolyError("Non-outward bound request", operation)
        // For x/a >= 0, sum{x/a} <= n, and k > 0, it follows that
        //
        //   k prod{x} <= k/n prod{a} sum{x/a}
        //
        // This follows from AM-GM; prod{x/a} <= (sum{x/a}/n)^n <= sum{x/a}/n
        const [cOp, ...operands] = f.operands, coeff = (cOp as ConstantNode<number>).value
        const opLins = operands.map(op => outward.get(op)!), ranges = opLins.map(getRange)
        if (ranges.some(r => r.min < 0 && r.max > 0))
          throw new PolyError("Zero-crossing", operation)
        // Set `a` to the centroid of `x`, normalizing so that `sum{x/a} = n`
        const cents = opLins.map(getCent)
        const factor = cents.reduce((accu, cent, i) => accu + (cent >= 0 ? ranges[i].max : ranges[i].min) / cent, 0)
        const prod = cents.reduce((a, b) => a * factor * b / opLins.length, coeff / factor)
        result = weightedSum(...opLins.map((op, i) => [prod / cents[i], op] as const))
        break
      }
      case "min": case "max": {
        const xs = f.operands.filter(x => x.operation !== "const"), op = allOperations[operation]
        const [x] = xs, xLin = context.get(x)!
        if (xs.length > 1) throw new PolyError("Multivariate", operation)
        if ((context === upper) === (operation === "min")) {
          result = xLin
          break
        }
        const c = op(f.operands.filter(x => x.operation === "const").map(x => (x as ConstantNode<number>).value))
        const { min, max } = getRange(xLin)
        result = interpolate(min, op([c, min]), max, op([c, max]), xLin) ?? { $c: op([min, max, c]) }
        break
      }
      case "res": {
        if (context !== upper) throw new PolyError("Non-upper bound request", operation)
        const [base] = f.operands, baseLin = lower.get(base)!
        const { min, max } = getRange(baseLin)
        // linear region 1 - base/2 or concave region with peak at base = 0
        if (min < 0 && max < 1.75) {
          result = weightedSum([1, { $c: 1 }], [-0.5, baseLin])
        }
        else {
          // Clamp `min` to guarantee upper bound
          const res = allOperations['res'], resMin = res([min])
          result = interpolate(min, resMin, max, res([max]), baseLin) ?? { $c: resMin }
        }
        break
      }
      case "threshold": {
        const [v, t, pOp, fOp] = f.operands
        if (pOp.operation !== "const" || fOp.operation !== "const" || t.operation !== "const")
          throw new PolyError("Unsupported pattern", operation)

        const threshold = t.value, pass = pOp.value, fail = fOp.value, x = t.value
        const minHalf = (pass > fail) === (context === upper)
        const vLin = minHalf ? upper.get(v)! : lower.get(v)!
        const { min, max } = getRange(vLin)
        if (min >= threshold) {
          result = { $c: pass }
          break
        }
        if (max < threshold) {
          result = { $c: fail }
          break
        }
        // min < threshold <= max
        const y = (context === upper) ? Math.max(pass, fail) : Math.min(pass, fail)
        const slope = (pass - fail) / (minHalf ? (threshold - min) : (max - threshold))
        result = slopePoint(slope, x, y, vLin)
        break
      }
      case "sum_frac": {
        const [base, cOp] = f.operands, baseLin = lower.get(base)!
        if (cOp.operation !== "const")
          throw new PolyError("Non-constant", operation)
        const c = cOp.value, loc = getCent(baseLin), slope = c / (loc + c) / (loc + c)
        result = slopePoint(slope, loc, loc / (c + loc), baseLin)
        break
      }

      case "data": case "match": case "lookup": case "subscript":
        throw new PolyError("Unsupported operation", operation)
      default: assertUnreachable(operation)
    }
    switch (parentContext) {
      case outward: case inward: parentContext.set(f, result)
    }
    switch (context) {
      case outward: case inward: parentContext.set(f, result)
    }
    context.set(f, result)
    return f
  })
  return nodes.map(node => upper.get(node)!)
}
class PolyError extends Error {
  constructor(cause: string, operation: string) {
    super(`Found ${cause} in ${operation} node when generating polynomial upper bound`)
  }
}
