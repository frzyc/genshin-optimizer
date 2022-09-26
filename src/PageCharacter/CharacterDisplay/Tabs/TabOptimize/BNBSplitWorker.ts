import { forEachNodes, mapContextualFormulas } from "../../../../Formula/internal";
import { allOperations, optimize, precompute } from "../../../../Formula/optimization";
import { NumNode, StrNode } from "../../../../Formula/type";
import { prod, sum } from "../../../../Formula/utils";
import { SlotKey } from "../../../../Types/consts";
import { LPConstraint, maximizeLP, Weights } from "../../../../Util/LP";
import { assertUnreachable, objectKeyValueMap, strictObjectMap } from "../../../../Util/Util";
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
    const _unused = polyUpperBound(this.nodes, computeFullArtRange(arts))
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
        return strictObjectMap(arts.values, arts => ({ kind: "id" as const, ids: new Set(arts.map(art => art.id)) }))
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
    const splitted = strictObjectMap(arts.values, arts => {
      const remaining = arts.map((art) => ({ art, cont: approxs[0].conts[art.id] }))
        .sort(({ cont: c1 }, { cont: c2 }) => c2 - c1)
      const minCont = remaining[remaining.length - 1]?.cont ?? 0
      let contCutoff = remaining.reduce((accu, { cont }) => accu + cont, -minCont * remaining.length) / 3

      const index = Math.max(1, remaining.findIndex(({ cont }) => ((contCutoff -= cont - minCont), contCutoff <= 0)))
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
        const maxConts = approxs.map((_, i) => strictObjectMap(currentCont, val => val[i]))
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
        const artRange = computeFullArtRange(arts), polys = polyUpperBound(nodes, artRange)
        approxs = polys.map(poly => approximation(poly, artRange, arts))
        maxConts = approxs.map(approx => strictObjectMap(arts.values, val => maxContribution(val, approx)))
      }
    }
    // Removing artifacts that doesn't meet the required opt target contributions.
    //
    // We could actually loop `newValues` computation if the removed artifacts have
    // the highest contribution in one of the target node as the removal will lower
    // the required contribution even further. However, once is generally enough.
    const newValues = strictObjectMap(arts.values, (arts, slot) => {
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
function approximation(monos: NumNode[], artRange: DynMinMax, arts: ArtifactsBySlot): Approximation {
  function contribution(weights: DynStat, art: DynStat) {
    return Object.entries(art).reduce((accu, [key, val]) => accu + val * (weights[key] ?? 0), 0)
  }

  const weight = linearUpperBound(monos, artRange)
  return {
    base: contribution(weight, arts.base) + weight.$c,
    conts: objectKeyValueMap(Object.values(arts.values).flat(),
      data => [data.id, contribution(weight, data.values)])
  }
}

/** Compute a linear upper bound of `poly`, which must be in polynomial form */
function linearUpperBound(monos: readonly NumNode[], artRange: DynMinMax): { [key in string | "$c"]: number } {
  // We use $c and $error internally. Can't have them collide
  if ("$c" in artRange || "$error" in artRange) throw new Error("Found forbidden key when computing linear upper bound")

  // List of read nodes in each monomial
  const terms = new Map(monos.map(mono => {
    let term = new Set<string>()
    forEachNodes([mono], _ => { }, f => { if (f.operation === "read") term.add(f.path[1]!) })
    return [mono, term]
  }))

  /**
   * From the list of monomials, find the corners of the hypercube involving
   * each variable in the monomial, subjected to `artRange` bounds. We then
   *
   *   minimize error over A, c, error
   *   s.t. error + poly(X) >= Ax + c >= poly(X) for each corner X
   *
   * This gives Ax + c as a linear upper bound in the region dictated by `artRange`.
   *
   * We translate the corners of the hypercube into the [0, 1] hypercube to improve
   * numerical stability, and translate it back to the original domain later.
   *
   * CAUTION:
   * It seems this expansion won't work if one of th variables have degree >= 2.
   * In that case, you need to expand `x^n` into `x1 * ... * xn` as separate variables.
   */
  const weights: Weights = { $c: 0, $error: 0 }
  let remaining = [...monos]
  while (remaining.length) {
    let chosen = [remaining.pop()!], setTerm = terms.get(chosen[0])!
    remaining = remaining.filter(mono => {
      const newTerm = new Set([...setTerm, ...terms.get(mono)!])
      // Include monomials that won't increase the problem size (too much)
      if (newTerm.size !== setTerm.size && newTerm.size > 4) return true
      chosen.push(mono)
      setTerm = newTerm
      return false
    })
    const compute = precompute([sum(...chosen)], {}, f => f.path[1], 1)

    const objective: Weights = { $error: -1 }, term = [...setTerm]
    const vars: Weights = {}, lpVars: Weights = { $c: 1 }, constraints: LPConstraint[] = []
    const add_constraint = (index: number) => {
      if (index >= term.length) {
        const [val] = compute([{ id: "", values: vars }])
        constraints.push(
          { weights: { ...lpVars }, lowerBound: val },
          { weights: { ...lpVars, $error: -1 }, upperBound: val },
        )
        return
      }
      const key = term[index], { min, max } = artRange[key]
      // Split upper/lower bound
      vars[key] = min
      delete lpVars[key]
      add_constraint(index + 1)

      vars[key] = max
      lpVars[key] = 1
      add_constraint(index + 1)
    }
    add_constraint(0)
    const additional_weight = maximizeLP(objective, constraints)
    Object.entries(additional_weight).forEach(([key, val]) => weights[key] = (weights[key] ?? 0) + val)
  }
  Object.entries(artRange).forEach(([key, { min, max }]) => {
    weights[key] /= max - min
    weights.$c -= weights[key] * min
  })
  delete weights.$error
  return weights
}

/** Convert `nodes` to a polynomial form where `nude[i] <= sum(...result[i])` and each `result[i][j]` is a monomial */
function polyUpperBound(nodes: NumNode[], artRange: DynMinMax): NumNode[][] {
  // We need bounds for some nodes to compute appropriate poly
  const nodeRange = new Map<NumNode | StrNode, MinMax>(), defaultRange = { min: NaN, max: NaN }
  forEachNodes(nodes, _ => { }, f => {
    const { operation, operands } = f
    switch (operation) {
      case "mul": case "min": case "max": case "res": case "sum_frac":
        nodeRange.set(f, defaultRange)
        operands.forEach(op => op.operation !== "const" && nodeRange.set(op, defaultRange))
        break
      case "threshold": nodeRange.set(operands[0], defaultRange); break
    }
  })
  {
    const ranges = computeNodeRange([...nodeRange.keys()] as NumNode[], artRange)
    ranges.forEach((val, key) => nodeRange.set(key, val))
  }
  function interpolate(x0: number, y0: number, x1: number, y1: number, node: NumNode): NumNode {
    if (Math.abs(x1 - x0) < 1e-10) throw new PolyError("degenerate interpolation", "interpolating")
    const slope = (y1 - y0) / (x1 - x0)
    return sum(y0 - x0 * slope, prod(slope, node))
  }
  const expanded = mapContextualFormulas(nodes, 1, (_f, context) => {
    const f = _f as NumNode, { operation } = f, operands = f.operands as NumNode[]
    // Context a | b
    //  a = 0 for lower bound, a = 1 for upper bound
    //  if b = 2, flip `a` if `f` is negative (doesn't propagate)
    if (context & 2) {
      const { min, max } = nodeRange.get(f)!
      context ^= (max <= 0) ? 3 : 2
      if (min < 0 && max > 0) throw new PolyError("zero-crossing", "flipping")
    }
    const isUpperBound = !!(context & 1)
    switch (operation) {
      case "const": case "read": case "add": return [f, context]
      case "mul": {
        if (!nodeRange.has(f)) {
          // Newly introduced node, which can only be in the form `c * x`
          const [c] = operands
          if (operands.length !== 2 || c.operation !== "const") assertUnreachable("Invalid node expansion" as never)
          return [f, context ^ (c.value < 0 ? 1 : 0)]
        }
        const { min, max } = nodeRange.get(f)!
        if (min < 0 && max > 0) throw new PolyError("zero-crossing", operation)
        /**
         * Flip the operand of the product if fx0 < 0, or more precisely, if f/x0 < 0.
         * If `f > 0`, we flip lower/upper bound for `x0` if `x0 < 0`.
         * If `f < 0`, then we flip `x0` if `x > 0`, or flip *twice* if `x0 < 0`.
         */
        return [f, context ^ (max <= 0 ? 3 : 2)]
      }
      case "res": {
        const [base] = operands, { min, max } = nodeRange.get(base)!
        if (isUpperBound) {
          // linear region 1 - base/2 or concave region with peak at base = 0
          if (min < 0 && max < 1.75) return [sum(1, prod(-0.5, base)), context]
          else {
            // Clamp `min` to guarantee upper bound
            const res = allOperations['res']
            return [interpolate(min, res([min]), max, res([max]), base), context]
          }
        } else throw new PolyError("lower bound requirement", operation)
      }
      case "sum_frac": {
        const [x, cOp] = operands
        if (cOp.operation !== 'const') throw new PolyError("non-constant denominator", operation)
        const { min, max } = nodeRange.get(x)!, c = cOp.value
        if (cOp.value < 0) throw new PolyError("negative constant", operation)

        if (isUpperBound === (min > -c)) {
          // sum_frac is concave when computing upper bound, or convex when computing lower bound.
          // In both cases, its linear approximation is a correct solution.
          const loc = Math.sqrt((min + c) * (max + c)) - c, below = (c + loc) * (c + loc)
          return [sum(loc * loc / below, prod(c / below, x)), context]
        } else {
          const sum_frac = allOperations["sum_frac"]
          return [interpolate(min, sum_frac([min, c]), max, sum_frac([max, c]), x), context]
        }
      }
      case "min": case "max": {
        const rOps = operands.filter(x => x.operation !== "const"), [rOp] = rOps
        if (rOps.length !== 1) throw new PolyError("non-unitary operand", operation)

        if ((operation === 'min') === isUpperBound) return [rOp, context] // ignore constant terms
        const { min: minY, max: maxY } = nodeRange.get(f)!
        const { min: minX, max: maxX } = nodeRange.get(rOp)!
        return [interpolate(minX, minY, maxX, maxY, rOp), context]
      }
      case "threshold": {
        const [val, thres, p, f] = operands
        if (thres.operation !== "const" || p.operation !== "const" || f.operation !== "const")
          throw new PolyError("unsupported node", operation)
        const threshold = thres.value, pass = p.value, fail = f.value
        const { min, max } = nodeRange.get(val)!

        // Due to pruning, we know that min < threshold < max
        // TODO: Make sure the resulting interpolation has no zero-crossing
        if ((pass > fail) === isUpperBound)
          return [interpolate(min, fail, threshold, pass, val), context]
        else return [interpolate(threshold, fail, max, pass, val), context]
      }
      case "data": case "subscript": case "lookup": case "match":
        throw new PolyError("unsupported node", operation)
      default: assertUnreachable(operation)
    }
  }, _f => {
    // Making sure that each monomial is propagated to the top as expansion at the end assumes so
    const f = _f as NumNode, { operation, operands } = f
    if (operation === "mul" && operands.some(op => op.operation === "add")) {
      let result: NumNode[][] = [[]]
      for (const operand of operands)
        if (operand.operation !== "add") result.forEach(nodes => nodes.push(operand))
        else result = operand.operands.flatMap(op => result.map(node => [...node, op]))
      return sum(...result.map(ops => prod(...ops)))
    }
    if (operation === "add" && operands.some(op => op.operation === "add"))
      return sum(...operands.flatMap(op => op.operation === "add" ? op.operands : [op]))
    return f
  })
  /**
   * The `linearUpperBound` borks when there are monomials with zero coefficient.
   * It should be safe enough if we simply don't add any zero constants during the expansion above.
   * This `optimize`, however, should also prevent zeros introduced elsewhere from entering the pipeline.
   *
   * We `optimize` *after* expanding each node as the deduplication process can combine some monomials.
   */
  return expanded.map(node => optimize(node.operation === "add" ? node.operands as NumNode[] : [node], {}))
}
class PolyError extends Error {
  constructor(cause: string, operation: string) {
    super(`Found ${cause} in ${operation} node when generating polynomial upper bound`)
  }
}
