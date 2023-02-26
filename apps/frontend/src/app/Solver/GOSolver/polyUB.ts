/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
export type PolynomialWithBounds = PolyProd | PolySum | LinTerm
type LinTerm = { type: 'lin', lin: Linear, min: number, max: number }
type PolyProd = { type: 'prod', terms: PolynomialWithBounds[], $k: number, min: number, max: number }
type PolySum = { type: 'sum', terms: PolynomialWithBounds[], $c: number, min: number, max: number }

function constP(n: number): LinTerm { return { type: 'lin', lin: { $c: n }, min: n, max: n } }
function readP(k: string, minmax: MinMax): LinTerm { return { type: 'lin', lin: { [k]: 1, $c: 0 }, ...minmax } }
function sumP(...terms:  (PolynomialWithBounds | number)[]): PolySum {
  const c = (terms.filter(v => (typeof v) === 'number') as number[]).reduce((a, b) => a + b, 0)
  const poly = terms.filter(v => (typeof v) !== 'number') as PolynomialWithBounds[]
  return {
    type: 'sum', terms: poly, $c: c,
    min: poly.reduce((a, { min }) => a + min, c),
    max: poly.reduce((a, { max }) => a + max, c),
  }
}
function prodP(...terms: (PolynomialWithBounds | number)[]): PolyProd {
  const k = (terms.filter(v => (typeof v) === 'number') as number[]).reduce((a, b) => a * b, 1)
  const poly = terms.filter(v => (typeof v) !== 'number') as PolynomialWithBounds[]
  const minMax = poly.reduce(({ min: min1, max: max1 }, { min: min2, max: max2 }) => {
    return { min: Math.min(min1 * min2, min1 * max2, max1 * min2, max1 * max2), max: Math.max(min1 * min2, min1 * max2, max1 * min2, max1 * max2) }
  }, { min: k, max: k })
  return { type: 'prod', terms: poly, $k: k, ...minMax }
}

function slopePoint(slope: number, x0: number, y0: number, poly: PolynomialWithBounds): PolynomialWithBounds {
  return sumP(y0 - slope * x0, prodP(slope, poly))
}
function interpolate(x0: number, y0: number, x1: number, y1: number, poly: PolynomialWithBounds, upper: boolean): PolynomialWithBounds {
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
  const statMinMax = computeFullArtRange(arts)
  const nodeRanges = computeNodeRange([...minMaxes.keys()], statMinMax)
  for (const [node, minMax] of nodeRanges.entries()) minMaxes.set(node, minMax)

  const upper = "u", lower = "l", exact = "e"
  type Context = typeof upper | typeof lower | typeof exact
  const poly = customMapFormula<Context, PolynomialWithBounds, OptNode>(nodes, upper, (f, context, _map) => {
    const { operation } = f
    const map: (op: OptNode, c?: Context) => PolynomialWithBounds = (op, c = context) => _map(op, c)
    const oppositeContext = context === upper ? lower : upper

    switch (operation) {
      case "const": return constP(f.value)
      case "read": return readP(f.path[1], minMaxes.get(f)!)
      case "add": return sumP(...f.operands.map(op => map(op)))
      case "mul": {
        if (context === exact) return prodP(...f.operands.map(op => map(op)))
        const { min: minf, max: maxf } = minMaxes.get(f)!
        if (minf === maxf) return constP(minf)  // Handles zero coeff
        const zeroCrossing = (minf * maxf < 0) || f.operands.some(op => {
          const { min, max } = minMaxes.get(op)!
          return min * max < 0
        })
        if (zeroCrossing) return map(f, exact)

        const signf = minf === 0 ? maxf : minf
        const op = allOperations[operation]
        const k = op(f.operands.filter(op => op.operation === "const").map(c => (c as ConstantNode<number>).value))
        const polys = f.operands.filter(op => op.operation !== "const").map(op => {
          const { min, max } = minMaxes.get(op)!
          const sign = min === 0 ? max : min
          const ctx = signf * sign > 0 ? context : oppositeContext
          const p = map(op, ctx)

          if ((ctx === lower && max > 0 && p.min < -min) ||
            (ctx === upper && min < 0 && p.max > -max))
            throw new PolyError("Unallowed large crossing post approximation", operation)

            return p
        })
        return prodP(k, ...polys)
      }
      case "min": case "max": {
        if (context === exact) throw new PolyError("Cannot be exactly represented", operation)
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
        if (context === exact) throw new PolyError("Cannot be exactly represented", operation)
        if (context === lower) throw new PolyError("Unsupported direction", operation)
        const op = allOperations[operation]
        const [xOp] = f.operands, { min, max } = minMaxes.get(xOp)!
        const x = map(xOp, oppositeContext)
        // Linear region 1 - base/2 or concave region with peak at base = 0
        if (min < 0 && max < 1.75) return sumP(1, prodP(-.5, x))
        // Clamp `min` to guarantee upper bound
        else return interpolate(min, op([min]), max, op([max]), x, context === upper)
      }
      case "sum_frac": {
        if (context === exact) throw new PolyError("Cannot be exactly represented", operation)
        if (context === lower) throw new PolyError("Unsupported direction", operation)
        const [xOp, cOp] = f.operands
        if (cOp.operation !== "const") throw new PolyError("Non-constant node", operation)
        const x = map(xOp), c = cOp.value, { min, max } = minMaxes.get(xOp)!
        if (min <= -c) throw new PolyError("Unallowed negative argument", operation)
        const loc = Math.sqrt((min + c) * (max + c))
        return slopePoint(c / (loc + c) / (loc + c), loc, loc / (loc + c), x)
      }
      case "threshold": {
        if (context === exact) throw new PolyError("Cannot be exactly represented", operation)
        const [vOp, tOp, pOp, fOp] = f.operands
        if (tOp.operation !== "const") throw new PolyError("Non-constant node", operation)
        const { min, max } = minMaxes.get(vOp)!
        if (min >= tOp.value) return map(pOp)
        if (max < tOp.value) return map(fOp)

        if (fOp.operation !== "const")
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
        // Can also interpolate slopePoint on 2nd half, but I choose not to
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
    if (mon[i].$k === 0) {
      mon.splice(i, 1)
      continue
    }
    const a = mon[i].terms
    const b = mon[i + 1].terms
    if (a.length !== b.length) continue
    if (a.every((ai, i) => ai === b[i])) {
      mon[i].$k = mon[i].$k + mon[i + 1].$k
      mon.splice(i + 1, 1)
    }
  }
  return mon
}
function expandPoly(node: PolynomialWithBounds): SumOfMonomials {
  function toExpandedPoly(n: PolynomialWithBounds): Monomial[] {
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
