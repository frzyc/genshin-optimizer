import { forEachNodes, mapFormulas } from "../../../../Formula/internal";
import { allOperations, precompute } from "../../../../Formula/optimization";
import { NumNode, StrNode } from "../../../../Formula/type";
import { constant, prod, sum } from "../../../../Formula/utils";
import { SlotKey } from "../../../../Types/consts";
import { LPConstraint, maximizeLP, Weights } from "../../../../Util/LP";
import { assertUnreachable, objectKeyValueMap, objectMap, strictObjectMap } from "../../../../Util/Util";
import type { InterimResult, Setup, SplitWorker } from "./BackgroundWorker";
import { ArtifactBuildData, ArtifactsBySlot, computeFullArtRange, computeNodeRange, countBuilds, DynMinMax, DynStat, filterArts, MinMax, pruneAll, RequestFilter } from "./common";

type Approximation = {
  base: number,
  /** optimization target contribution from a given artifact (id) */
  conts: StrictDict<string, number>
}
type Filter = { nodes: NumNode[], arts: ArtifactsBySlot, maxConts: Record<SlotKey, number>[], approxs: Approximation[], age: number }
export class FastSplitWorker implements SplitWorker {
  min: number[]
  nodes: NumNode[]
  arts: ArtifactsBySlot
  maxBuilds: number

  filters: Filter[] = []
  interim: InterimResult | undefined

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
    const arts = filterArts(this.arts, filter)
    this.filters.push({ nodes: this.nodes, arts, maxConts: [], approxs: [], age: 0 })
  }
  async split(newThreshold: number, minCount: number): Promise<RequestFilter | undefined> {
    if (newThreshold > this.min[0]) this.min[0] = newThreshold

    while (this.filters.length) {
      const filter = this.filters.pop()!, { nodes, arts, maxConts, age } = filter
      const oldCount = countBuilds(arts)

      if (!(age % 5)) {
        // The problem should've gotten small enough that
        // the old approximation becomes inaccurate
        const { nodes: newNodes, arts: newArts } = pruneAll(nodes, this.min, arts, this.maxBuilds, {}, { pruneNodeRange: true })
        const newCounts = countBuilds(newArts)
        if (oldCount !== newCounts) this.addSkip(oldCount - newCounts)
        if (newCounts) {
          const artRange = computeFullArtRange(newArts), polys = polyUpperBound(newNodes, artRange)
          const approxs = polys.map(poly => approximation(poly, artRange, newArts))
          const maxConts = approxs.map(approx => strictObjectMap(newArts.values, val => maxContribution(val, approx)))
          this.filters.push({ nodes: newNodes, arts: newArts, maxConts, approxs, age: age + 1 })
        }
        continue
      }

      const { min } = this
      if (maxConts.some((cont, i) => Object.values(cont).reduce((a, b) => a + b, 0) < min[i])) {
        this.addSkip(oldCount)
        continue
      }
      if (oldCount <= minCount) {
        if (this.interim) {
          this.callback(this.interim)
          this.interim = undefined
        }
        return strictObjectMap(arts.values, arts => ({ kind: "id" as const, ids: new Set(arts.map(art => art.id)) }))
      }

      const remaining = this.splitOldFilter(filter)
      if (oldCount !== remaining) this.addSkip(oldCount - remaining)
    }
    if (this.interim) {
      this.callback(this.interim)
      this.interim = undefined
    }
    return undefined
  }
  addSkip(count: number) {
    if (this.interim) this.interim.skipped += count
    else this.interim = { command: "interim", buildValues: undefined, tested: 0, failed: 0, skipped: count, }
  }

  splitOldFilter({ nodes, arts, maxConts: maxContributions, approxs, age }: Filter): number {
    let totalRemaining = 1
    const splitted = strictObjectMap(arts.values, (arts, slot) => {
      const requiredConts = maxContributions.map((cont, i) => Object.values(cont)
        .reduce((accu, val) => accu - val, this.min[i] - approxs[i].base + cont[slot]))
      const remaining: { art: ArtifactBuildData, cont: number }[] = arts
        .filter(({ id }) => approxs.every(({ conts }, i) => conts[id] > requiredConts[i]))
        .map((art) => ({ art, cont: approxs[0].conts[art.id] }))
        .sort(({ cont: c1 }, { cont: c2 }) => c2 - c1)
      totalRemaining *= remaining.length
      const minCont = remaining[remaining.length - 1]?.cont ?? 0
      let contCutoff = remaining.reduce((accu, { cont }) => accu + cont, -minCont * remaining.length) / 3

      const index = Math.max(1, remaining.findIndex(({ cont }) => ((contCutoff -= cont - minCont), contCutoff <= 0)))
      const lowArts = remaining.splice(index).map(({ art }) => art), highArts = remaining.map(({ art }) => art)
      return {
        high: { arts: highArts, maxConts: approxs.map(approx => maxContribution(highArts, approx)), },
        low: { arts: lowArts, maxConts: approxs.map(approx => maxContribution(lowArts, approx)) },
      }
    })

    const { filters } = this, remaining = Object.keys(splitted)
    const current: StrictDict<SlotKey, ArtifactBuildData[]> = {} as any
    const currentCont: StrictDict<SlotKey, number[]> = {} as any
    function partialSplit() {
      if (!remaining.length) {
        const maxConts = approxs.map((_, i) => strictObjectMap(currentCont, val => val[i]))
        return filters.push({ nodes, arts: { base: arts.base, values: { ...current } }, maxConts, approxs, age: age + 1 })
      }
      const slot = remaining.pop()!, { high, low } = splitted[slot]
      if (low.arts.length) {
        current[slot] = low.arts
        currentCont[slot] = low.maxConts
        partialSplit()
      }
      if (high.arts.length) {
        current[slot] = high.arts
        currentCont[slot] = high.maxConts
        partialSplit()
      }
      remaining.push(slot)
    }
    partialSplit()
    return totalRemaining
  }
}

function maxContribution(arts: ArtifactBuildData[], approximation: Approximation): number {
  return Math.max(...arts.map(({ id }) => approximation.conts[id]!))
}
function approximation(poly: NumNode, artRange: DynMinMax, arts: ArtifactsBySlot): Approximation {
  function contribution(weights: DynStat, art: DynStat) {
    return Object.entries(art).reduce((accu, [key, val]) => accu + val * (weights[key] ?? 0), 0)
  }

  const weight = linearUpperBound(poly, artRange)
  return {
    base: contribution(weight, arts.base) + weight.$c,
    conts: objectKeyValueMap(Object.values(arts.values).flat(),
      data => [data.id, contribution(weight, data.values)])
  }
}

/** Compute a linear upper bound of `poly`, which must be in polynomial form */
function linearUpperBound(poly: NumNode, artRange: DynMinMax): { [key in string | "$c"]: number } {
  // We use $c and $error internally. Can't have them collide
  if ("$c" in artRange || "$error" in artRange) throw new Error("Found forbidden key when computing linear upperbound")

  /**
   * We first compute the monomials found in each node and store them in `term`.
   * Monomials are represented using one-hot encoding, e.g., given variables
   * [a, b, c], a value [1 << 2, (1 << 0 | 1 << 1)] represents a polynomial of
   * the form `f1(c), f2(a, b)` where `f1` and `f2` are some polynomial functions.
   */

  const bounds = Object.entries(artRange), ids = objectMap(artRange, (_, _k, i) => BigInt(1) << BigInt(i))
  const terms = new Map<NumNode | StrNode, Set<bigint>>()
  forEachNodes([poly], _ => { }, f => {
    const { operation, operands } = f, operandTerms = operands.map(op => [...terms.get(op)!])
    switch (operation) {
      case "const": terms.set(f, new Set([BigInt(0)])); break
      case "read": terms.set(f, new Set([ids[f.path[1]]!])); break
      case "add": terms.set(f, new Set(operandTerms.flat())); break
      case "mul": terms.set(f, new Set(operandTerms.reduce((a, x) => a.flatMap(a => x.map(b => a | b)), [BigInt(0)]))); break
      default: throw new Error(`Found unsupported ${operation} node when computing linear upperbound group`)
    }
  })

  /**
   * From the list of monomials, find the corners of the hypercube involving
   * each variable in the monomial, subjected to `artRange` bounds. We then
   *
   *   minimize error over A, c, error
   *   s.t. error + poly(X) >= Ax + c >= poly(X) for each corner X
   *
   * This gives Ax + c as a linear upperbound in the region dictated by `artRange`.
   */
  const added: bigint[] = [], weights: Weights = { $c: 0, $error: 0 }
  const compute = precompute([poly], {}, f => f.path[1], 1)
  const [offset] = compute([{ id: "", values: {} }]), objective: Weights = { $error: -1 }
  for (const term of [...terms.get(poly)!].sort((a, b) => a > b ? -1 : 1)) {
    if (added.some(added => (added & term) === term)) continue
    added.push(term)

    const vars: Weights = {}, lpVars: Weights = { $c: 1 }, constraints: LPConstraint[] = []
    const add_constraint = (index: number, current: bigint) => {
      if (index >= bounds.length) {
        const [val] = compute([{ id: "", values: vars }])
        constraints.push(
          { weights: { ...lpVars }, lowerBound: val - offset },
          { weights: { ...lpVars, $error: -1 }, upperBound: val - offset },
        )
        return
      }
      const [key, { min, max }] = bounds[index]
      if (current & term) {
        // Split upper/lower bound
        vars[key] = min
        delete lpVars[key]
        add_constraint(index + 1, current << BigInt(1))

        vars[key] = max
        lpVars[key] = 1
        add_constraint(index + 1, current << BigInt(1))
      } else {
        // Use zero and skip
        add_constraint(index + 1, current << BigInt(1))
      }
    }
    add_constraint(0, BigInt(1))
    const additional_weight = maximizeLP(objective, constraints)
    Object.entries(additional_weight).forEach(([key, val]) => weights[key] = (weights[key] ?? 0) + val)
  }
  bounds.forEach(([key, { min, max }]) => {
    weights[key] /= max - min
    weights.$c -= weights[key] * min
  })
  weights.$c += offset
  delete weights.$error
  return weights
}

/** Convert `nodes` to a polynomial form */
function polyUpperBound(nodes: NumNode[], artRange: DynMinMax): NumNode[] {
  // We need some bounds for the nodes to find appropriate polynomial upper bound
  const nodeRange = new Map<NumNode | StrNode, MinMax>(), defaultRange = { min: NaN, max: NaN }
  forEachNodes(nodes, _ => { }, f => {
    const { operation, operands } = f
    switch (operation) {
      case "min": case "max":
        nodeRange.set(f, defaultRange)
        operands.forEach(op => op.operation !== "const" && nodeRange.set(op, defaultRange))
        break
      case "threshold": nodeRange.set(operands[0], defaultRange); break
      case "res": case "sum_frac": operands.forEach(op => nodeRange.set(op, defaultRange)); break
    }
  })
  {
    const ranges = computeNodeRange([...nodeRange.keys()] as NumNode[], artRange)
    ranges.forEach((val, key) => nodeRange.set(key, val))
  }
  function interpolate(p0: [x: number, y: number], p1: [x: number, y: number], node: NumNode): NumNode {
    const [x0, y0] = p0, [x1, y1] = p1, slope = (y1 - y0) / (x1 - x0)
    if (Math.abs(x0 - x1) < 1e-6) return constant(Math.max(y0, y1)) // degenerate case
    return sum(y0 - x0 * slope, prod(slope, node))
  }

  return mapFormulas(nodes, f => f, (f, orig) => {
    const { operands, operation } = f
    let result: NumNode | StrNode
    switch (operation) {
      case "const": case "read": case "add": case "mul": result = f; break
      case "res": {
        const [base] = operands, { min, max } = nodeRange.get(base)!, res = allOperations['res']
        // linear region 1 - base/2 or concave region with peak at base = 0
        if (min < 0 && max < 1.75) result = sum(1, prod(-0.5, base))
        else {
          const m = Math.max(min, 0) // Clamp `min` to guarantee upperbound
          result = interpolate([m, res([m])], [max, res([max])], base)
        }
        break
      }
      case "sum_frac": {
        const [x, cOp] = operands
        if (cOp.operation !== 'const') throw new Error('Not Implemented (non-constant sum_frac denominator)')

        const { min, max } = nodeRange.get(x)!, c = cOp.value
        // The sum_frac form is concave, so its linear approximation is also a linear upperbound.
        const loc = Math.sqrt((min + c) * (max + c)) - c, below = (c + loc) * (c + loc)
        result = sum(loc * loc / below, prod(c / below, x))
        break
      }
      case "min": case "max": {
        const rOps: NumNode[] = operands.filter(x => x.operation !== "const"), [rOp] = rOps
        if (rOps.length !== 1)
          throw new Error("Found unsupported min/max node when computing upperbound polynomial")
        if (operation === 'min') {
          result = rOp // ignore constant terms
          break
        }
        const { min: minY, max: maxY } = nodeRange.get(f)!
        const { min: minX, max: maxX } = nodeRange.get(rOp)!
        result = interpolate([minX, minY], [maxX, maxY], rOp)
        break
      }
      case "threshold": {
        const [val, thres, p, f]: readonly NumNode[] = operands
        if (thres.operation !== "const" || p.operation !== "const" || f.operation !== "const")
          throw new Error("Unsupported threshold node when computing upperbound polynomial")

        const threshold = thres.value, pass = p.value, fail = f.value
        const { min, max } = nodeRange.get(val)!
        if (max < threshold) result = f
        else if (min >= threshold) result = p
        else if (pass > fail) result = interpolate([min, fail], [threshold, pass], val)
        else result = interpolate([threshold, fail], [max, pass], val)
        break
      }
      case "data": case "subscript": case "lookup": case "match": case "prio": case "small":
        throw new Error(`Found unsupported ${operation} node when computing upperbound polynomial`)
      default: assertUnreachable(operation)
    }
    if (nodeRange.has(orig) && result !== orig)
      nodeRange.set(result, nodeRange.get(orig)!)
    return result
  })
}
