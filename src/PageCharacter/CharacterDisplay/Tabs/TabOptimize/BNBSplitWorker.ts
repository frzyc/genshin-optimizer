import { customMapFormula, forEachNodes } from "../../../../Formula/internal";
import { allOperations } from "../../../../Formula/optimization";
import { ConstantNode, NumNode } from "../../../../Formula/type";
import { prod, threshold } from "../../../../Formula/utils";
import { SlotKey } from "../../../../Types/consts";
import { maximizeLP } from "../../../../Util/LP";
import { assertUnreachable, crawlObject, layeredAssignment, objectKeyValueMap, objectMap, objPathValue } from "../../../../Util/Util";
import type { InterimResult, Setup, SplitWorker } from "./BackgroundWorker";
import { ArtifactBuildData, ArtifactsBySlot, computeFullArtRange, computeNodeRange, countBuilds, DynMinMax, DynStat, filterArts, MinMax, pruneAll, RequestFilter } from "./common";

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

  constructor({ arts, optimizationTarget, filters, maxBuilds }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.min = [-Infinity, ...filters.map(x => x.min)]
    this.nodes = [optimizationTarget, ...filters.map(x => x.value)]
    this.callback = callback
    this.maxBuilds = maxBuilds

    // make sure we can approximate it
    polyUpperBound(this.nodes, computeFullArtRange(arts))
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
      this.reportInterim(false)
      if (!count) continue

      if (count <= minCount) {
        this.reportInterim(true)
        return objectMap(arts.values, arts => ({ kind: "id" as const, ids: new Set(arts.map(art => art.id)) }))
      }
      this.splitOldFilter(filter)
    }
    this.reportInterim(true)
    return undefined
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
      ({ nodes, arts } = pruneAll(nodes, this.min, arts, this.maxBuilds, {}, { pruneNodeRange: true }))
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
  const ranges = computeFullArtRange(arts)
  const polys = polyUpperBound(nodes, ranges)
  return linearUpperBound(polys, ranges).map(weight => ({
    base: dot(arts.base, weight) + (weight.$c ?? 0),
    conts: objectKeyValueMap(Object.values(arts.values).flat(),
      data => [data.id, dot(data.values, weight)])
  }))
}

type Linear = { [key: string]: number }
function dot(values: DynStat, lin: Linear): number {
  return Object.entries(lin).reduce((accu, [key, val]) => accu + (values[key] ?? 0) * val, 0)
}

type Const = { $c: number }
/**
 * Keys on the key path represents the keys used in each monomial term. The coefficient
 * is `number` at the leaf of the path, with `$c` as a separater. For example, the following
 *
 * {
 *   x: {
 *     $c: 2,
 *     y: { $c: 3 }
 *   }
 * }
 *
 * represents 2x * 3xy. The key `$c` is necessary because, without it, we can't express sum of
 * two monomials where one uses a subset of the keys of another, e.g., the example above.
 *
 * CAUTION:
 * Typescript isn't strong enough to enforce that the key `$c`,and only `$c`, can map to `number`
 * values. As is, care must be taken when constructing/updating `Poly`.
 */
type Poly = { [key: string]: Poly } | Const
function weightedSum(...entries: readonly (readonly [number, Poly])[]): Poly {
  if (entries.length === 1 && entries[0][0] === 1) return entries[0][1]
  const keys = new Set(entries.flatMap(([_, poly]) => Object.keys(poly))), result: Poly = {}
  for (const key of keys) {
    if (key === "$c")
      result[key] = entries.reduce((accu, [weight, poly]) => accu + weight * (poly.$c as number ?? 0), 0) as any
    else
      result[key] = weightedSum(...entries
        .map(([weight, poly]) => [weight, poly[key] as Poly] as const)
        .filter(([_, poly]) => poly))
  }
  return result
}

function linearUpperBound(polys: Poly[], ranges: DynMinMax): Linear[] {
  /** Merge two (sorted) strings, keeping duplicity */
  function merge(a: string[], b: string[]): string[] {
    const result: string[] = [], bLen = b.length
    let ai = 0, bi = 0
    while (bi < bLen) {
      if (a[ai] === b[bi]) result.push(a[(bi++, ai++)])
      // If `ai >= aLen`, the condition is automatically not met
      else if (a[ai] < b[bi]) result.push(a[ai++])
      else result.push(b[bi++])
    }
    result.push(...a.slice(ai))
    return result
  }
  /** a * bVal, adjusted for appropriate keys, requiring that `a` is a subset of `b` */
  function apply(a: string[], b: string[], bVal: number[]): number {
    let bi = 0
    return a.reduce((accu, key) => {
      while (key !== b[bi]) bi++
      return accu * bVal[bi++]
    }, 1)
  }
  return polys.map(poly => {
    let terms: { path: string[], coeff: number }[] = [], weights: Linear = { $c: 0 }
    crawlObject(poly, [], v => typeof v === "number", (coeff, path) =>
      terms.push({ path: path.slice(0, -1).sort(), coeff }))
    terms.sort((a, b) => b.path.length - a.path.length)

    while (terms.length) {
      let path = terms[0].path, chosen: (typeof terms[number])[] = []
      terms = terms.filter(term => {
        let candidatePath = merge(term.path, path)
        if (path.length === candidatePath.length || candidatePath.length <= 5) {
          chosen.push(term)
          path = candidatePath
          return false
        } else return true
      })

      /**
       * minimize e over w+, w-, c+, c-, e >= 0
       * s.t. val + e >= x * w + c >= val for each corner x and val = f(x)
       * where w = w+ - w- and c = c+ - c- .
       *
       * Terms are arranged as [x0+, x1+, ..., x0-, x1-, ..., c+, c-, e]
       */
      const constraints: number[][] = []
      const permute = (i: number, dir: number[], vals: number[]): void => {
        if (i === path.length) {
          const value = chosen.reduce((accu, { path: chosenPath, coeff }) =>
            accu + coeff * apply(chosenPath, path, vals), 0)
          const negDir = dir.map(x => -x)
          constraints.push([-value, ...negDir, ...dir, -1, 1, +0]) // x + c >= val
          constraints.push([+value, ...dir, ...negDir, 1, -1, -1]) // x + c <= val + e
          return
        }

        const key = path[i], { min, max } = ranges[key]!
        permute(i + 1, [...dir, 0], [...vals, min])
        permute(i + 1, [...dir, 1], [...vals, max])
      }
      permute(0, [], [])
      const objective = [...Array<number>(2 * path.length + 2).fill(0), -1]

      const pos = maximizeLP(objective, constraints)
      const neg = pos.slice(path.length), [c, negC] = neg.slice(path.length)
      path.forEach((key, i) => {
        if (!weights[key]) weights[key] = 0
        weights[key] += pos[i] - neg[i]
      })
      weights.$c += c - negC
    }

    throw "TODO: Renormalize weight"
    return weights
  })
}

/** Compute a poly upper bound of `nodes` */
function polyUpperBound(nodes: NumNode[], ranges: DynMinMax): Poly[] {
  if (ranges["$c"]) throw new PolyError("Unsupported key", "init")
  const minMaxes = new Map<NumNode, MinMax>()
  forEachNodes(nodes, _f => {
    const f = _f as NumNode, { operation } = f
    if (operation === "mul") minMaxes.set(f, { min: NaN, max: NaN })
    switch (operation) {
      case "mul": case "min": case "max": case "threshold": case "res": case "sum_frac":
        f.operands.forEach(op => minMaxes.set(op, { min: NaN, max: NaN })); break
    }
  }, _ => _)
  for (const [node, minMax] of computeNodeRange([...minMaxes.keys()], ranges)) minMaxes.set(node, minMax)

  function slopePoint(slope: number, x0: number, y0: number, poly: Poly): Poly {
    return weightedSum([1, { $c: y0 - slope * x0 }], [slope, poly])
  }
  function interpolate(x0: number, y0: number, x1: number, y1: number, poly: Poly, upper: boolean): Poly {
    if (Math.abs(x0 - x1) < 1e-10)
      return { $c: upper ? Math.max(y0, y1) : Math.min(y0, y1) }
    return slopePoint((y1 - y0) / (x1 - x0), x0, y0, poly)
  }

  const upper = "u", lower = "l", outward = "o"
  type Context = typeof upper | typeof lower | typeof outward
  return customMapFormula<Context, Poly>(nodes, upper, (_f, context, _map) => {
    const f = _f as NumNode, { operation } = f
    const map: (op: NumNode, c?: Context) => Poly = (op, c = context) => _map(op, c)
    const oppositeContext = context === upper ? lower : upper

    if (context === outward) {
      const { min, max } = minMaxes.get(f)!
      if (min < 0 && max > 0)
        // TODO: We can bypass this restriction by converting `f`
        // to `min(f, 0)` or `max(f, 0)` as appropriate
        throw new PolyError("Zero-crossing (outward)", operation)
      return map(f, max <= 0 ? lower : upper)
    }

    switch (operation) {
      case "const": return { $c: f.value }
      case "read": return { [f.path[1]]: { $c: 1 } }
      case "add": return weightedSum(...f.operands.map(op => [1, map(op)] as const))
      case "min": case "max": {
        const op = allOperations[operation]
        const xs = f.operands.filter(op => op.operation !== "const"), [xOp] = xs
        if (xs.length !== 1) throw new PolyError("Multivariate", operation)

        const x = map(xOp), c = op(f.operands.filter(op => op.operation === "const")
          .map(c => (c as ConstantNode<number>).value))
        if (operation === (context === lower ? "max" : "min")) return x
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
        const c = cOp.value, { min, max } = minMaxes.get(xOp)!, loc = Math.sqrt((min + c) * (max + c))
        if (min <= -c) throw new PolyError("Unsupported pattern", operation)

        const x = map(xOp), slope = c / (c + loc) / (c + loc), yLoc = loc / (loc + c)
        return slopePoint(slope, loc, yLoc, x)
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
          throw new PolyError("Unsupported Direction", operation)

        const operands = [...f.operands], flattenedOperands: NumNode[] = []
        let coeff = 1
        while (operands.length) {
          const operand = operands.pop()!
          if (operand.operation === "mul") operands.push(...operand.operands)
          else if (operand.operation === "const") coeff *= operand.value;
          else flattenedOperands.push(operand)
        }
        return flattenedOperands.reduce((result, op) => {
          let newResult: Poly = {}, lin = map(op, outward)
          crawlObject(result, [], v => typeof v === "number", (val: number, keys: string[]) => {
            const path = keys.slice(0, -1) // Remove trailing "$c"
            const old = objPathValue(newResult, path)
            const newValue = old
              ? weightedSum([1, old], [val, lin])
              : weightedSum([val, lin])
            if (path.length) layeredAssignment(newResult, path, newValue)
            else newResult = newValue
          })
          return newResult
        }, { $c: coeff } as Poly)
      }

      case "data": case "match": case "lookup": case "subscript":
        throw new PolyError("Unsupported operation", operation)
      default: assertUnreachable(operation)
    }
  })
}
class PolyError extends Error {
  constructor(cause: string, operation: string) {
    super(`Found ${cause} in ${operation} node when generating polynomial upper bound`)
  }
}
