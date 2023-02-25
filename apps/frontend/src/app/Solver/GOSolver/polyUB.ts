import { customMapFormula, forEachNodes } from "../../Formula/internal";
import { OptNode, allOperations } from "../../Formula/optimization";
import { ConstantNode } from "../../Formula/type";
import { prod, threshold } from "../../Formula/utils";
import { assertUnreachable, cartesian } from "../../Util/Util";
import { ArtifactsBySlot, MinMax, computeFullArtRange, computeNodeRange } from "../common";
import { Linear } from "./linearUB";

/**
 * With xi being the variables and pi(x1, x2, ...) being polynomials on xi
 *    LinTerm  = $c + w1*x1 + w2*x2 + ...
 *    PolyProd = $k * p1 * p2 * ...
 *    PolySum  = $c + p1 + p2 + ...
 *
 * $c is used as additive constant, $k is used as multiplicative constant.
 */
export type Polynomial = PolyProd | PolySum | LinTerm
type LinTerm = { type: 'lin', lin: Linear }
type PolyProd = { type: 'prod', terms: Polynomial[], $k: number }
type PolySum = { type: 'sum', terms: Polynomial[], $c: number }

/** Convenience functions modify in-place if possible */
function constP(n: number): LinTerm { return { type: 'lin', lin: { $c: n } } }
function readP(k: string): LinTerm { return { type: 'lin', lin: { [k]: 1, $c: 0 } } }
function sumP(...terms: (Polynomial | number)[]): PolySum {
  const c = (terms.filter(v => (typeof v) === 'number') as number[]).reduce((a, b) => a + b, 0)
  const poly = terms.filter(v => (typeof v) !== 'number') as Polynomial[]
  return { type: 'sum', terms: poly, $c: c }
}
function prodP(...terms: (Polynomial | number)[]): PolyProd {
  const k = (terms.filter(v => (typeof v) === 'number') as number[]).reduce((a, b) => a * b, 1)
  const poly = terms.filter(v => (typeof v) !== 'number') as Polynomial[]
  return { type: 'prod', terms: poly, $k: k }
}

function slopePoint(slope: number, x0: number, y0: number, poly: Polynomial): Polynomial {
  return sumP(y0 - slope * x0, prodP(slope, poly))
}
function interpolate(x0: number, y0: number, x1: number, y1: number, poly: Polynomial, upper: boolean): Polynomial {
  if (Math.abs(x0 - x1) < 1e-10)
    return constP(upper ? Math.max(y0, y1) : Math.min(y0, y1))
  return slopePoint((y1 - y0) / (x1 - x0), x0, y0, poly)
}

export function polyUB(nodes: OptNode[], arts: ArtifactsBySlot): SumOfMonomials[] {
  const minMaxes = new Map<OptNode, MinMax>()
  forEachNodes(nodes, f => {
    const { operation } = f
    if (operation === "mul") minMaxes.set(f, { min: NaN, max: NaN })
    switch (operation) {
      case "mul": case "min": case "max": case "threshold": case "res": case "sum_frac":
        f.operands.forEach(op => minMaxes.set(op, { min: NaN, max: NaN }))
    }
  }, _ => _)
  const nodeRanges = computeNodeRange([...minMaxes.keys()], computeFullArtRange(arts))
  for (const [node, minMax] of nodeRanges.entries()) minMaxes.set(node, minMax)

  const upper = "u", lower = "l"
  type Context = typeof upper | typeof lower
  const poly = customMapFormula<Context, Polynomial, OptNode>(nodes, upper, (f, context, _map) => {
    const { operation } = f
    const map: (op: OptNode, c?: Context) => Polynomial = (op, c = context) => _map(op, c)
    const oppositeContext = context === upper ? lower : upper

    switch (operation) {
      case "const": return constP(f.value)
      case "read": return readP(f.path[1])
      case "add": return sumP(...f.operands.map(op => map(op)))
      case "mul": {
        f.operands.forEach(op => {
          const {min, max} = minMaxes.get(op)!
          if (op.operation !== "const" && min < 0) throw new PolyError("Unallowed negative argument", operation)
        })

        const op = allOperations[operation]
        const k = op(f.operands.filter(op => op.operation === "const").map(c => (c as ConstantNode<number>).value))
        const ctx = k >= 0 ? context : oppositeContext
        const ops = f.operands.filter(op => op.operation !== "const").map(op => map(op, ctx))
        const ret = prodP(k, ...ops)
        return ret
      }
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
        if (min < 0 && max < 1.75) return sumP(1, prodP(-.5, x))
        // Clamp `min` to guarantee upper bound
        else return interpolate(min, op([min]), max, op([max]), x, context === upper)
      }
      case "sum_frac": {
        if (context !== upper) throw new PolyError("Unsupported direction", operation)
        const [xOp, cOp] = f.operands
        if (cOp.operation !== "const") throw new PolyError("Non-constant node", operation)
        const x = map(xOp), c = cOp.value, { min, max } = minMaxes.get(xOp)!
        if (min <= -c) throw new PolyError("Unallowed negative argument", operation)
        const loc = Math.sqrt((min + c) * (max + c))
        return slopePoint(c / (loc + c) / (loc + c), loc, loc / (loc + c), x)
      }
      case "threshold": {
        const [vOp, tOp, pOp, fOp] = f.operands
        if (tOp.operation !== "const") throw new PolyError("Non-constant node", operation)
        const { min, max } = minMaxes.get(vOp)!
        if (min >= tOp.value) return map(pOp)
        if (max < tOp.value) return map(fOp)

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
        const thresh = tOp.value, pass = pOp.value, fail = fOp.value
        const isFirstHalf = (pass > fail) === (context === upper)

        const v = map(vOp, isFirstHalf ? upper : lower)
        if (isFirstHalf) {
          const slope = (pass - fail) / (thresh - min)
          return slopePoint(slope, thresh, pass, v)
        }
        // not first half -> return const(fail)
        // Can interpolate slopePoint on 2nd half, but I choose not to
        return constP(fail)
      }
      default: assertUnreachable(operation)
    }
  })

  return poly.map(p => expandPoly(p))
}

export type SumOfMonomials = Monomial[]
type Monomial = {
  $k: number
  terms: string[]
}
function constM(v: number): Monomial { return { $k: v, terms: [] } }
function weightedReadM(key: string, v: number): Monomial { return { $k: v, terms: [key] } }
function sumM(...monomials: Monomial[][]): Monomial[] { return monomials.flat() }
function prodM(...monomials: Monomial[][]): Monomial[] {
  return cartesian(...monomials).map(monos => monos.reduce((ret, nxt) => {
    ret.$k *= nxt.$k
    ret.terms.push(...nxt.terms)
    return ret
  }, { $k: 1, terms: [] }))
}
function foldLikeTerms(mon: Monomial[]): Monomial[] {
  mon.forEach(m => m.terms.sort())
  mon.sort(({ terms: termsA }, { terms: termsB }) => {
    if (termsA.length !== termsB.length) return termsA.length - termsB.length
    for (let i = 0; i < termsA.length; i++) { if (termsA[i] !== termsB[i]) return termsA[i] < termsB[i] ? -1 : +1 }
    return 0
  })

  for (let i = mon.length - 2; i >= 0; i--) {
    const a = mon[i].terms
    const b = mon[i + 1].terms
    if (a.length !== b.length) continue
    if (a.every((ai, i) => ai === b[i])) {
      mon[i].$k = (mon[i].$k ?? 0) + (mon[i + 1].$k ?? 0)
      mon.splice(i + 1, 1)
    }
  }
  return mon
}
function expandPoly(node: Polynomial): SumOfMonomials {
  function toExpandedPoly(n: Polynomial): Monomial[] {
    switch (n.type) {
      case 'lin':
        return Object.entries(n.lin).filter(([k, v]) => v !== 0).map(([k, v]) => {
          if (k === '$c') return constM(v)
          return weightedReadM(k, v)
        })
      case 'sum':
        return sumM(...n.terms.map(t => toExpandedPoly(t)), [constM(n.$c)])
      case 'prod':
        return prodM(...n.terms.map(t => toExpandedPoly(t)), [constM(n.$k)])
    }
  }

  return foldLikeTerms(toExpandedPoly(node))
}

class PolyError extends Error {
  constructor(cause: string, operation: string) {
    super(`Found ${cause} in ${operation} node when generating polynomial upper bound`)
  }
}
