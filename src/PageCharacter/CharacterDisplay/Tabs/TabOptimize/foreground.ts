import Artifact from "../../../../Data/Artifacts/Artifact";
import { input } from "../../../../Formula";
import { computeUIData } from "../../../../Formula/api";
import { formulaString } from "../../../../Formula/debug";
import { forEachNodes, mapFormulas } from "../../../../Formula/internal";
import { allOperations, precompute } from "../../../../Formula/optimization";
import { Data, NumNode, StrNode } from "../../../../Formula/type";
import { constant, prod, setReadNodeKeys, sum } from "../../../../Formula/utils";
import { allMainStatKeys, allSubstatKeys, ICachedArtifact } from "../../../../Types/artifact";
import { assertUnreachable, crawlObject, deepClone, layeredAssignment, objectKeyMap, objectMap, objPathValue } from "../../../../Util/Util";
import { ArtifactBuildData, ArtifactsBySlot, computeNodeRange, DynMinMax, DynStat, MinMax } from "./common";
import iGLPK, { GLPK, LP } from "glpk.js"

const glpkPromise = (iGLPK as any)() as Promise<GLPK>

const dynamic = setReadNodeKeys(deepClone({ dyn: { ...input.art, ...input.artSet } }))
export const dynamicData = {
  art: objectKeyMap([...allMainStatKeys, ...allSubstatKeys], key => dynamic.dyn[key]),
  artSet: objectMap(input.artSet, (_, key) => dynamic.dyn[key]),
}

export function compactArtifacts(arts: ICachedArtifact[], mainStatAssumptionLevel: number, allowPartial: boolean): ArtifactsBySlot {
  const result: ArtifactsBySlot = {
    base: {},
    values: { flower: [], plume: [], goblet: [], circlet: [], sands: [] }
  }
  const keys = new Set<string>()

  for (const art of arts) {
    const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level))

    const data: ArtifactBuildData = {
      id: art.id, set: art.setKey,
      values: {
        [art.setKey]: 1,
        [art.mainStatKey]: art.mainStatKey.endsWith('_') ? mainStatVal / 100 : mainStatVal,
        ...Object.fromEntries(art.substats.map(substat =>
          [substat.key, substat.key.endsWith('_') ? substat.accurateValue / 100 : substat.accurateValue]))
      },
    }
    delete data.values[""]
    result.values[art.slotKey].push(data)
    Object.keys(data.values).forEach(x => keys.add(x))
  }
  result.base = objectKeyMap([...keys], _ => 0)
  if (allowPartial)
    for (const value of Object.values(result.values))
      value.push({ id: "", values: {} })
  return result
}

export function debugCompute(nodes: NumNode[], base: DynStat, arts: ArtifactBuildData[]) {
  const stats = { ...base }
  for (const art of arts) {
    for (const [key, value] of Object.entries(art.values)) {
      stats[key] = (stats[key] ?? 0) + value
    }
  }
  const data = { dyn: Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, constant(value)])) } as Data
  const uiData = computeUIData([data])
  return {
    base, arts, stats,
    data, uiData,
    nodes: nodes.map(formulaString),
    results: nodes.map(node => uiData.get(node)),
  }
}

/** Compute a linear upper bound of `poly`, which must be in polynomial form */
export async function linearUpperBound(poly: NumNode, artRange: DynMinMax): Promise<{ [key in string]: number }> {
  /**
   * We first compute the monomials found in each node and store them in `term`.
   * Each `object` represents the monomials as key paths to the an empty object.
   * E.g., an obj `{ a: { b: {}, c: {} } }` represents a polynomial of the form
   * `f1(a, b), f2(a, b)` where `f1` and `f2` are some polynomial functions.
   */

  const terms = new Map<NumNode | StrNode, object>(), atoms = new Set<string>()
  function addInplace(a_out: any, b: any): any {
    for (const [key, value] of Object.entries(b)) {
      if (key in a_out) {
        const obj = { ...a_out[key] }
        a_out[key] = obj
        addInplace(obj, value)
      } else a_out[key] = value
    }
    return a_out
  }
  function mul(a: any, b: any): any {
    const result: any = {}
    crawlObject(a, undefined, x => !Object.keys(x).length, (_, pathA) => {
      crawlObject(b, undefined, x => !Object.keys(x).length, (_, pathB) => {
        const path = [...new Set([...pathA, ...pathB])].sort(), old = objPathValue(result, path)
        if (!old) layeredAssignment(result, path, {})
      })
    })
    return result
  }
  forEachNodes([poly], _ => { }, f => {
    const { operation, operands } = f
    switch (operation) {
      case "const": terms.set(f, {}); break
      case "read": terms.set(f, { [f.path[1]]: {} }); atoms.add(f.path[1]); break
      case "add": terms.set(f, operands.map(x => terms.get(x)!).reduce(addInplace, {})); break
      case "mul": terms.set(f, operands.map(x => terms.get(x)!).reduce(mul, {})); break
      default: throw new Error(`Found unsupported ${operation} node when computing linear upperbound group`)
    }
  })

  /**
   * From the list of monomials, find the corners of the hypercube involving
   * each variable in the monomial, subjected to `artRange` bounds. We then optimize
   *
   *   minimize error over A, c
   *   s.t. error + poly(X) >= Ax + c >= poly(X) for each corner X
   *
   * This gives Ax + c as a linear upperbound in the region dictated by `artRange`.
   */
  const glpk = await glpkPromise
  const problem: LP = {
    name: "LP",
    objective: {
      direction: glpk.GLP_MIN,
      name: "obj",
      vars: [{ name: "$error", coef: 1 }]
    },
    subjectTo: [],
    bounds: [{ name: "$error", type: glpk.GLP_LO, ub: NaN, lb: 0 }]
  }
  const constraints = problem.subjectTo, map = new Map<string, number>()
  const bounds = Object.entries(artRange).filter(([key]) => atoms.has(key)).sort(([a], [b]) => a < b ? -1 : 1)
  if (bounds.length > 30)
    // Left-shift (<<) operator used to encode the variable operates
    // on 32-bit integer, so any more bounds would cause problems.
    throw new Error("Too many variables")

  const [compute, mapping, buffer] = precompute([poly], f => f.path[1])

  bounds.forEach(([key], i) => map.set(key, i))
  function add_constraint(id: number) {
    const constraint: typeof constraints[number] = { name: `${id}l`, vars: [{ name: "$c", coef: 1 }], bnds: { type: 0, ub: 0, lb: 0 } }
    const vars = constraint.vars
    bounds.forEach(([key, { min, max }], i) => {
      const coef = (id & (1 << i)) ? max : min
      vars.push({ name: key, coef })
      buffer[mapping[key]!] = coef
    })
    const [val] = compute()
    constraint.bnds = { type: glpk.GLP_LO, ub: NaN, lb: val }
    constraints.push(constraint)
    constraints.push({ name: `${id}u`, vars: [...constraint.vars, { name: "$error", coef: -1 }], bnds: { type: glpk.GLP_UP, ub: val, lb: NaN } })
  }

  // Add constraints to the set first to deduplicate entries
  const constraint_ids = new Set([0])
  function add_id(id: number, remaining: any, index: number): void {
    if (index >= bounds.length) {
      constraint_ids.add(id)
      return
    }
    const [key] = bounds[index]
    if (key in remaining) {
      add_id(id | (1 << index), remaining[key], index + 1)
      add_id(id, remaining[key], index + 1)
    }
    add_id(id, remaining, index + 1)
  }
  add_id(0, terms.get(poly)!, 0)
  constraint_ids.forEach(add_constraint)

  return await glpk.solve(problem).result.vars
}

/** Convert `nodes` to a polynomial form */
export function polyUpperBound(nodes: NumNode[], artRange: DynMinMax): NumNode[] {
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
        if (max <= 0 || max < 0)
          result = sum(1, prod(-0.5, base)) // linear region 1 - base/2 or concave region with peak at base = 0
        else result = interpolate([min, res([min])], [max, res([max])], base) // convex region
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
