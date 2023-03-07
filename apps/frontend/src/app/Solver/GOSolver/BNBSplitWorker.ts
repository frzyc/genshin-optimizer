import { Interim, Setup } from "..";
import { customMapFormula, forEachNodes } from "../../Formula/internal";
import { allOperations, OptNode } from "../../Formula/optimization";
import { ConstantNode } from "../../Formula/type";
import { prod, threshold } from "../../Formula/utils";
import { SlotKey } from "../../Types/consts";
import { assertUnreachable, objectKeyValueMap, objectMap } from "../../Util/Util";
import { ArtifactBuildData, ArtifactsBySlot, computeFullArtRange, computeNodeRange, countBuilds, DynStat, filterArts, MinMax, pruneAll, RequestFilter } from "../common";
import type { SplitWorker } from "./BackgroundWorker";

type Approximation = {
  base: number,
  /** optimization target contribution from a given artifact (id) */
  conts: StrictDict<string, number>
}
type Filter = {
  nodes: OptNode[], arts: ArtifactsBySlot
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
  min: number[]
  nodes: OptNode[]
  arts: ArtifactsBySlot
  topN: number

  /**
   * Filters are not neccessarily in a valid state, i.e., "calculated".
   * We amortize the calculation to 1-per-split so that the calculation
   * overhead doesn't lead to lag.
   */
  filters: Filter[] = []
  interim: Interim | undefined
  firstUncalculated = 0

  callback: (interim: Interim) => void

  constructor({ arts, optTarget, constraints, topN }: Setup, callback: (interim: Interim) => void) {
    this.arts = arts
    this.min = [-Infinity, ...constraints.map(x => x.min)]
    this.nodes = [optTarget, ...constraints.map(x => x.value)]
    this.callback = callback
    this.topN = topN

    // make sure we can approximate it
    linearUpperBound(this.nodes, arts)
  }

  addFilter(filter: RequestFilter): void {
    const arts = filterArts(this.arts, filter), count = countBuilds(arts)
    if (count)
      this.filters.push({ nodes: this.nodes, arts, maxConts: [], approxs: [], age: 0, count })
  }
  setThreshold(newThreshold: number): void {
    if (newThreshold > this.min[0]) {
      this.min[0] = newThreshold
      // All calculations become stale
      this.firstUncalculated = 0
      this.filters.forEach(filter => delete filter.calculated)
    }
  }
  *split(filter: RequestFilter, minCount: number): Generator<RequestFilter> {
    this.addFilter(filter)

    while (this.filters.length) {
      const filter = this.getApproxFilter(), { arts, count } = filter

      if (count <= minCount) {
        if (!count) continue
        if (this.firstUncalculated < this.filters.length)
          this.calculateFilter(this.firstUncalculated++) // Amortize the filter calculation to 1-per-split

        this.reportInterim(false)
        yield objectMap(arts.values, arts => ({ kind: "id" as const, ids: new Set(arts.map(art => art.id)) }))
      } else
        this.splitOldFilter(filter)
    }

    this.reportInterim(true)
  }

  reportInterim(forced = false) {
    if (this.interim && (this.interim.skipped > 1000000 || forced === true)) {
      this.callback(this.interim)
      this.interim = undefined
    }
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
    if (age < 3 || age % 5 === 2) { // Make sure the condition includes initial filter `age === 0`
      // Either the filter is so early that we can get a good cutoff, or the problem has
      // gotten small enough that the old approximation becomes inaccurate
      ({ nodes, arts } = pruneAll(nodes, this.min, arts, this.topN, {}, { pruneNodeRange: true }))
      if (Object.values(arts.values).every(x => x.length)) {
        approxs = approximation(nodes, arts)
        maxConts = approxs.map(approx => objectMap(arts.values, val => maxContribution(val, approx)))
      }
    }
    // Removing artifacts that doesn't meet the required opt target contributions.
    //
    // We could actually loop `newValues` computation if the removed artifacts have
    // the highest contribution in one of the target node as the removal will raise
    // the required contribution even further. However, once is generally enough.
    const leadingConts = maxConts.map((cont, i) => Object.values(cont)
      .reduce((accu, val) => accu + val, approxs[i].base - this.min[i]))
    const newValues = objectMap(arts.values, (arts, slot) => {
      const requiredConts = leadingConts.map((lc, i) => maxConts[i][slot] - lc)
      return arts.filter(({ id }) => approxs.every(({ conts }, i) => conts[id] >= requiredConts[i]))
    })
    arts = { base: arts.base, values: newValues }
    const newCount = countBuilds(arts)
    if (newCount !== oldCount)
      if (this.interim) this.interim.skipped += oldCount - newCount
      else this.interim = { resultType: "interim", buildValues: undefined, tested: 0, failed: 0, skipped: oldCount - newCount }
    this.filters[i] = { nodes, arts, maxConts, approxs, age, count: newCount, calculated: true }
  }
}

function maxContribution(arts: ArtifactBuildData[], approximation: Approximation): number {
  return Math.max(...arts.map(({ id }) => approximation.conts[id]!))
}
function approximation(nodes: OptNode[], arts: ArtifactsBySlot): Approximation[] {
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
export type Linear = DynStat & { $c: number }
/** Compute a linear upper bound of `nodes` */
export function linearUpperBound(nodes: OptNode[], arts: ArtifactsBySlot): Linear[] {
  const cents = weightedSum([1, arts.base], ...Object.values(arts.values).map(arts =>
    [1 / arts.length, weightedSum(...arts.map(art => [1, art.values] as const))] as const))
  const getCent = (lin: Linear) => dot(cents, lin, lin.$c)

  const minMaxes = new Map<OptNode, MinMax>()
  forEachNodes(nodes, f => {
    const { operation } = f
    if (operation === "mul") minMaxes.set(f, { min: NaN, max: NaN })
    switch (operation) {
      case "mul": case "min": case "max": case "threshold": case "res": case "sum_frac":
        f.operands.forEach(op => minMaxes.set(op, { min: NaN, max: NaN })); break
    }
  }, _ => _)
  const nodeRanges = computeNodeRange([...minMaxes.keys()], computeFullArtRange(arts))
  for (const [node, minMax] of nodeRanges.entries()) minMaxes.set(node, minMax)

  function slopePoint(slope: number, x0: number, y0: number, lin: Linear): Linear {
    return weightedSum([1, { $c: y0 - slope * x0 }], [slope, lin])
  }
  function interpolate(x0: number, y0: number, x1: number, y1: number, lin: Linear, upper: boolean): Linear {
    if (Math.abs(x0 - x1) < 1e-10)
      return { $c: upper ? Math.max(y0, y1) : Math.min(y0, y1) }
    return slopePoint((y1 - y0) / (x1 - x0), x0, y0, lin)
  }

  const upper = "u", lower = "l", outward = "o"
  type Context = typeof upper | typeof lower | typeof outward
  return customMapFormula<Context, Linear, OptNode>(nodes, upper, (f, context, _map) => {
    const { operation } = f
    const map: (op: OptNode, c?: Context) => Linear = (op, c = context) => _map(op, c)
    const oppositeContext = context === upper ? lower : upper

    if (context === outward) {
      const { min, max } = minMaxes.get(f)!
      if (min < 0 && max > 0)
        // TODO: We can bypass this restriction by converting `f`
        // to `min(f, 0)` or `max(f, 0)` as appropriate
        throw new PolyError("Zero-crossing", operation)
      return map(f, max <= 0 ? lower : upper)
    }

    switch (operation) {
      case "const": return { $c: f.value }
      case "read": return { $c: 0, [f.path[1]]: 1 }
      case "add": return weightedSum(...f.operands.map(op => [1, map(op)] as const))
      case "min": case "max": {
        const op = allOperations[operation]
        const xs = f.operands.filter(op => op.operation !== "const"), [xOp] = xs
        if (xs.length !== 1) throw new PolyError("Multivariate", operation)

        const x = map(xOp), c = op(f.operands.filter(op => op.operation === "const")
          .map(c => (c as ConstantNode<number>).value))
        if ((operation === "max" && context === lower) || (operation === "min" && context === upper))
          return x
        const { min, max } = minMaxes.get(xOp)!, yMin = op([min, c]), yMax = op([max, c])
        return interpolate(min, yMin, max, yMax, x, context === upper)
      }
      case "res": {
        if (context !== upper) throw new PolyError("Unsupported direction", operation)
        const op = allOperations[operation]
        const [xOp] = f.operands, { min, max } = minMaxes.get(xOp)!
        const x = map(xOp, oppositeContext)
        // Linear region 1 - base/2 or concave region with peak at base = 0
        if (min < 0 && max < 1.75) return weightedSum([1, { $c: 1 }], [-0.5, x])
        // Clamp `min` to guarantee upper bound
        else return interpolate(min, op([min]), max, op([max]), x, context === upper)
      }
      case "sum_frac": {
        if (context !== upper) throw new PolyError("Unsupported direction", operation)
        const [xOp, cOp] = f.operands
        if (cOp.operation !== "const") throw new PolyError("Non-constant node", operation)
        const x = map(xOp), c = cOp.value, { min, max } = minMaxes.get(xOp)!
        const loc = Math.sqrt((min + c) * (max + c))
        if (min <= -c) throw new PolyError("Unsupported pattern", operation)
        return slopePoint(c / (c + loc) / (c + loc), loc, loc / (loc + c), x)
      }
      case "threshold": {
        const [vOp, tOp, pOp, fOp] = f.operands
        if (fOp.operation !== "const" || tOp.operation !== "const")
          throw new PolyError("Non-constant node", operation)
        if (pOp.operation !== "const") {
          if (fOp.value !== 0) throw new PolyError("Unsupported pattern", operation)

          const threshOp = threshold(vOp, tOp, 1, fOp), mulOp = prod(threshOp, pOp)
          // Populate `minMaxes` to ensure consistency
          const { min, max } = minMaxes.get(pOp)!
          minMaxes.set(threshOp, { min: 0, max: 1 })
          minMaxes.set(mulOp, { min: Math.min(min, 0), max: Math.max(max, 0) })
          return map(mulOp)
        }
        const { min, max } = minMaxes.get(vOp)!
        const thresh = tOp.value, pass = pOp.value, fail = fOp.value
        const isFirstHalf = (pass > fail) === (context === upper)

        const v = map(vOp, pass > fail ? context : oppositeContext)
        const yThresh = isFirstHalf ? pass : fail
        const slope = (pass - fail) / (isFirstHalf ? (thresh - min) : (max - thresh))
        return slopePoint(slope, thresh, yThresh, v)
      }
      case "mul": {
        const { min, max } = minMaxes.get(f)!
        if (min < 0 && max > 0) throw new PolyError("Zero-crossing", operation)
        if ((min < 0 && context !== lower) || (max > 0 && context !== upper))
          throw new PolyError("Unsupported direction", operation)

        // For x/a >= 0, sum{x/a} <= n, and k > 0, it follows that
        //
        //   k prod{x} <= k/n prod{a} sum{x/a}
        //
        // This follows from AM-GM; prod{x/a} <= (sum{x/a}/n)^n <= sum{x/a}/n
        const operands = [...f.operands], flattenedOperands: OptNode[] = []
        let coeff = 1
        while (operands.length) {
          const operand = operands.pop()!
          if (operand.operation === "mul") operands.push(...operand.operands)
          else if (operand.operation === "const") coeff *= operand.value;
          else flattenedOperands.push(operand)
        }
        const lins = flattenedOperands.map(op => map(op, outward))
        const ranges = flattenedOperands.map(op => minMaxes.get(op)!)

        // Set `a` to the centroid of `x`, normalizing so that `sum{x/a} = n`
        const cents = lins.map(getCent)
        const factor = cents.reduce((accu, cent, i) => accu + (cent >= 0 ? ranges[i].max : ranges[i].min) / cent, 0)
        const prod = cents.reduce((a, b) => a * factor * b / lins.length, coeff / factor)
        return weightedSum(...lins.map((op, i) => [prod / cents[i], op] as const))
      }

      default: assertUnreachable(operation)
    }
  })
}
class PolyError extends Error {
  constructor(cause: string, operation: string) {
    super(`Found ${cause} in ${operation} node when generating polynomial upper bound`)
  }
}
