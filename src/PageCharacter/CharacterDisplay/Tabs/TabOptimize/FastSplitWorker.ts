import { forEachNodes, mapFormulas } from "../../../../Formula/internal";
import { allOperations, precompute } from "../../../../Formula/optimization";
import { NumNode, StrNode } from "../../../../Formula/type";
import { constant, prod, sum } from "../../../../Formula/utils";
import { SlotKey } from "../../../../Types/consts";
import { maximizeLP, Weights, LPConstraint } from "../../../../Util/LP";
import { assertUnreachable, clamp01, objectKeyValueMap, objectMap, strictObjectMap } from "../../../../Util/Util";
import type { InterimResult, Setup, SplitWorker } from "./BackgroundWorker";
import { ArtifactBuildData, ArtifactsBySlot, computeFullArtRange, computeNodeRange, countBuilds, DynMinMax, DynStat, filterArts, MinMax, RequestFilter } from "./common";

type Approximation = {
  base: number,
  /** optimization target contribution from a given artifact (id) */
  conts: StrictDict<string, number>
}
type Filter = { arts: ArtifactsBySlot, maxConts: Record<SlotKey, number>[], approxs: Approximation[], age: number }
export class FastSplitWorker implements SplitWorker {
  min: number[]
  nodes: NumNode[]
  arts: ArtifactsBySlot

  filters: Filter[] = []
  interim: InterimResult | undefined

  callback: (interim: InterimResult) => void

  constructor({ arts, optimizationTarget, filters }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.min = [-Infinity, ...filters.map(x => x.min)]
    this.nodes = [optimizationTarget, ...filters.map(x => x.value)]
    this.callback = callback

    // make sure we can approximate it
    const _unused = polyUpperBound(this.nodes, computeFullArtRange(arts))
  }

  addFilter(filter: RequestFilter): void {
    const arts = filterArts(this.arts, filter)
    this.filters.push({ arts, maxConts: [], approxs: [], age: 0 })
  }
  async split(newThreshold: number, minCount: number): Promise<RequestFilter | undefined> {
    if (newThreshold > this.min[0]) this.min[0] = newThreshold

    while (this.filters.length) {
      const filter = this.filters.pop()!, { arts, maxConts: maxContributions, approxs: approximations, age } = filter

      if (!(age % 5)) {
        // The problem should've gotten small enough that
        // the old approximation becomes inaccurate
        const artRange = computeFullArtRange(arts)
        const polys = polyUpperBound(this.nodes, artRange)
        const approxs = polys.map(poly => approximation(poly, artRange, arts))
        const maxConts = approxs.map(approx => strictObjectMap(arts.values, val => maxContribution(val, approx)))
        this.filters.push({ arts, maxConts, approxs, age: age + 1 })
        continue
      }

      const { min } = this, count = countBuilds(arts)
      if (maxContributions.some((cont, i) => Object.values(cont).reduce((a, b) => a + b, 0) < min[i])) {
        this.addSkip(count)
        continue
      }
      if (count <= minCount) {
        if (this.interim) {
          this.callback(this.interim)
          this.interim = undefined
        }
        return strictObjectMap(arts.values, arts => ({ kind: "id" as const, ids: new Set(arts.map(art => art.id)) }))
      }

      const remaining = this.splitOldFilter(filter)
      if (count !== remaining) this.addSkip(count - remaining)
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

  splitOldFilter({ arts, maxConts: maxContributions, approxs, age }: Filter): number {
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
        return filters.push({ arts: { base: arts.base, values: { ...current } }, maxConts, approxs, age: age + 1 })
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
    return Object.entries(art).reduce((accu, [key, val]) => accu + val * weights[key]!, 0)
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
  /**
   * We first compute the monomials found in each node and store them in `term`.
   * Monomials are represented using one-hot encoding, e.g., given variables
   * [a, b, c], a value [1 << 2, (1 << 0 | 1 << 1)] represents a polynomial of
   * the form `f1(c), f2(a, b)` where `f1` and `f2` are some polynomial functions.
   */

  const bounds = Object.entries(artRange), ids = objectMap(artRange, (_, _k, i) => BigInt(1) << BigInt(i))
  const terms = new Map<NumNode | StrNode, Set<bigint>>()
  forEachNodes([poly], _ => { }, f => {
    const { operation, operands } = f
    switch (operation) {
      case "const": terms.set(f, new Set([BigInt(0)])); break
      case "read": terms.set(f, new Set([ids[f.path[1]]!])); break
      case "add": terms.set(f, new Set(operands.flatMap(x => [...terms.get(x)!]))); break
      case "mul": terms.set(f, new Set(operands.reduce((a, x) => a.flatMap(a => [...terms.get(x)!].map(b => a | b)), [BigInt(0)]))); break
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
  if ("$c" in artRange) throw new Error("Found forbidden ket `$c` when computing linear upperbound")
  const obj: Weights = { $error: -1 }, vars: Weights = { $c: 1 }
  const constraints: LPConstraint[] = [{ weights: { $error: 1 }, lowerBound: 0 },]
  const [compute, mapping, buffer] = precompute([poly], f => f.path[1])

  function add_constraint(index: number, id: bigint, list: bigint[]) {
    if (index >= bounds.length) {
      const [val] = compute()
      constraints.push(
        { weights: { ...vars }, lowerBound: val },
        { weights: { ...vars, $error: -1 }, upperBound: val },
      )
      return
    }
    const maxList = list.filter(num => num & id)
    const [name, { min, max }] = bounds[index], mapped = mapping[name]!
    function bound(val: number, list: bigint[]) {
      buffer[mapped] = val
      vars[name] = val
      add_constraint(index + 1, id << BigInt(1), list)
      delete vars[name]
    }
    if (maxList.length) bound(max, maxList)
    bound(min, list)
  }
  const polyTerms = [...terms.get(poly)!]
  if (polyTerms.length) add_constraint(0, BigInt(1 << 0), polyTerms)
  return maximizeLP(obj, constraints)
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
        result = interpolate([Math.max(min, threshold), fail], [max, pass], val)
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
