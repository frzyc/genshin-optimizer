import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { isArtifactSetKey } from '@genshin-optimizer/consts'
import { customMapFormula, forEachNodes } from '../../../Formula/internal'
import type { OptNode } from '../../../Formula/optimization'
import { allOperations } from '../../../Formula/optimization'
import type { ConstantNode } from '../../../Formula/type'
import { prod, threshold } from '../../../Formula/utils'
import { assertUnreachable, cartesian } from '../../../Util/Util'
import type { ArtifactsBySlot, DynStat, MinMax } from '../../common'
import { computeFullArtRange, computeNodeRange } from '../../common'

/**
 * With xi being the variables and pi(x1, x2, ...) being polynomials on xi
 *    LinTerm  = $c + w1*x1 + w2*x2 + ...
 *    PolyProd = $k * p1 * p2 * ...
 *    PolySum  = $c + p1 + p2 + ...
 *
 * $c is used as additive constant, $k is used as multiplicative constant.
 */
export type PolynomialWithBounds = PolyProd | PolySum | Term | Const
type Term = {
  type: 'term'
  key: string
  min: number
  max: number
  artSet?: {
    key: ArtifactSetKey
    thresh: number
  }
}
type Const = { type: 'const'; $c: number; min: number; max: number }
type PolyProd = {
  type: 'prod'
  terms: PolynomialWithBounds[]
  $k: number
  min: number
  max: number
}
type PolySum = {
  type: 'sum'
  terms: PolynomialWithBounds[]
  $c: number
  min: number
  max: number
}

function constP(n: number): Const {
  return { type: 'const', $c: n, min: n, max: n }
}
function readP(k: string, minmax: MinMax): Term {
  return { type: 'term', key: k, ...minmax }
}
function sumP(...terms: (PolynomialWithBounds | number)[]): PolySum {
  const c = (terms.filter((v) => typeof v === 'number') as number[]).reduce(
    (a, b) => a + b,
    0
  )
  const poly = terms.filter(
    (v) => typeof v !== 'number'
  ) as PolynomialWithBounds[]
  return {
    type: 'sum',
    terms: poly,
    $c: c,
    min: poly.reduce((a, { min }) => a + min, c),
    max: poly.reduce((a, { max }) => a + max, c),
  }
}
function prodP(...terms: (PolynomialWithBounds | number)[]): PolyProd {
  const k = (terms.filter((v) => typeof v === 'number') as number[]).reduce(
    (a, b) => a * b,
    1
  )
  const poly = terms.filter(
    (v) => typeof v !== 'number'
  ) as PolynomialWithBounds[]
  const minMax = poly.reduce(
    ({ min: min1, max: max1 }, { min: min2, max: max2 }) => {
      return {
        min: Math.min(min1 * min2, min1 * max2, max1 * min2, max1 * max2),
        max: Math.max(min1 * min2, min1 * max2, max1 * min2, max1 * max2),
      }
    },
    { min: k, max: k }
  )
  return { type: 'prod', terms: poly, $k: k, ...minMax }
}

function slopePoint(
  slope: number,
  x0: number,
  y0: number,
  poly: PolynomialWithBounds
): PolynomialWithBounds {
  return sumP(y0 - slope * x0, prodP(slope, poly))
}
function interpolate(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  poly: PolynomialWithBounds,
  upper: boolean
): PolynomialWithBounds {
  if (Math.abs(x0 - x1) < 1e-10)
    return constP(upper ? Math.max(y0, y1) : Math.min(y0, y1))
  return slopePoint((y1 - y0) / (x1 - x0), x0, y0, poly)
}

export function polyUB(
  nodes: OptNode[],
  arts: ArtifactsBySlot
): SumOfMonomials[] {
  const minMaxes = new Map<OptNode, MinMax>()
  forEachNodes(
    nodes,
    (f) => {
      const { operation } = f
      if (operation === 'mul') minMaxes.set(f, { min: NaN, max: NaN })
      switch (operation) {
        case 'mul':
        case 'min':
        case 'max':
        case 'threshold':
        case 'res':
        case 'sum_frac':
          f.operands.forEach((op) => minMaxes.set(op, { min: NaN, max: NaN }))
      }
    },
    (_) => _
  )
  const statMinMax = computeFullArtRange(arts)
  const nodeRanges = computeNodeRange([...minMaxes.keys()], statMinMax)
  for (const [node, minMax] of nodeRanges.entries()) minMaxes.set(node, minMax)

  const upper = 'u',
    lower = 'l',
    exact = 'e'
  type Context = typeof upper | typeof lower | typeof exact
  const poly = customMapFormula<Context, PolynomialWithBounds, OptNode>(
    nodes,
    upper,
    (f, context, _map) => {
      const { operation } = f
      const map: (op: OptNode, c?: Context) => PolynomialWithBounds = (
        op,
        c = context
      ) => _map(op, c)
      const oppositeContext = context === upper ? lower : upper

      switch (operation) {
        case 'const':
          return constP(f.value)
        case 'read':
          return readP(f.path[1], minMaxes.get(f)!)
        case 'add':
          return sumP(...f.operands.map((op) => map(op)))
        case 'mul': {
          if (context === exact)
            return prodP(...f.operands.map((op) => map(op)))
          const { min: minf, max: maxf } = minMaxes.get(f)!
          if (minf === maxf) return constP(minf) // Handles zero coeff
          const zeroCrossing =
            minf * maxf < 0 ||
            f.operands.some((op) => {
              const { min, max } = minMaxes.get(op)!
              return min * max < 0
            })
          if (zeroCrossing) return map(f, exact)

          const signf = minf === 0 ? maxf : minf
          const op = allOperations[operation]
          const k = op(
            f.operands
              .filter((op) => op.operation === 'const')
              .map((c) => (c as ConstantNode<number>).value)
          )
          const polys = f.operands
            .filter((op) => op.operation !== 'const')
            .map((op) => {
              const { min, max } = minMaxes.get(op)!
              const sign = min === 0 ? max : min
              const ctx = signf * sign > 0 ? context : oppositeContext
              const p = map(op, ctx)

              if (
                (ctx === lower && max > 0 && p.min < -min) ||
                (ctx === upper && min < 0 && p.max > -max)
              )
                throw new PolyError(
                  'Unallowed large crossing post approximation',
                  operation
                )

              return p
            })
          return prodP(k, ...polys)
        }
        case 'min':
        case 'max': {
          if (context === exact)
            throw new PolyError('Cannot be exactly represented', operation)
          const op = allOperations[operation]
          const xs = f.operands.filter((op) => op.operation !== 'const'),
            [xOp] = xs
          if (xs.length !== 1) throw new PolyError('Multivariate', operation)

          const x = map(xOp),
            c = op(
              f.operands
                .filter((op) => op.operation === 'const')
                .map((c) => (c as ConstantNode<number>).value)
            )
          if (
            (operation === 'max' && context === lower) ||
            (operation === 'min' && context === upper)
          )
            return x
          const { min, max } = minMaxes.get(xOp)!,
            yMin = op([min, c]),
            yMax = op([max, c])
          return interpolate(min, yMin, max, yMax, x, context === upper)
        }
        case 'res': {
          if (context === exact)
            throw new PolyError('Cannot be exactly represented', operation)
          if (context === lower)
            throw new PolyError('Unsupported direction', operation)
          const op = allOperations[operation]
          const [xOp] = f.operands,
            { min, max } = minMaxes.get(xOp)!
          const x = map(xOp, oppositeContext)
          // Linear region 1 - base/2 or concave region with peak at base = 0
          if (min < 0 && max < 1.75) return sumP(1, prodP(-0.5, x))
          // Clamp `min` to guarantee upper bound
          else
            return interpolate(
              min,
              op([min]),
              max,
              op([max]),
              x,
              context === upper
            )
        }
        case 'sum_frac': {
          if (context === exact)
            throw new PolyError('Cannot be exactly represented', operation)
          if (context === lower)
            throw new PolyError('Unsupported direction', operation)
          const [xOp, cOp] = f.operands
          if (cOp.operation !== 'const')
            throw new PolyError('Non-constant node', operation)
          const x = map(xOp),
            c = cOp.value,
            { min, max } = minMaxes.get(xOp)!
          if (min <= -c)
            throw new PolyError('Unallowed negative argument', operation)
          const loc = Math.sqrt((min + c) * (max + c))
          return slopePoint(c / (loc + c) / (loc + c), loc, loc / (loc + c), x)
        }
        case 'threshold': {
          if (context === exact)
            throw new PolyError('Cannot be exactly represented', operation)
          const [vOp, tOp, pOp, fOp] = f.operands
          if (tOp.operation !== 'const')
            throw new PolyError('Non-constant node', operation)
          const { min, max } = minMaxes.get(vOp)!
          if (min >= tOp.value) return map(pOp)
          if (max < tOp.value) return map(fOp)

          if (fOp.operation !== 'const')
            throw new PolyError('Non-constant node', operation)
          if (pOp.operation !== 'const') {
            if (fOp.value !== 0)
              throw new PolyError('Unsupported pattern', operation)

            const threshOp = threshold(vOp, tOp, 1, fOp),
              mulOp = prod(threshOp, pOp)
            // Populate `minMaxes` to ensure consistency
            const { min, max } = minMaxes.get(pOp)!
            minMaxes.set(threshOp, { min: 0, max: 1 })
            minMaxes.set(mulOp, {
              min: Math.min(min, 0),
              max: Math.max(max, 0),
            })
            return map(mulOp)
          }
          const thresh = tOp.value,
            pass = pOp.value,
            fail = fOp.value
          const isFirstHalf = pass > fail === (context === upper)

          let v = map(vOp, isFirstHalf ? upper : lower)
          if (
            v.type === 'term' &&
            vOp.operation === 'read' &&
            isArtifactSetKey(vOp.path[1])
          )
            v = { ...v, artSet: { key: vOp.path[1], thresh } }
          if (isFirstHalf) {
            const slope = (pass - fail) / (thresh - min)
            return slopePoint(slope, thresh, pass, v)
          }
          // not first half -> return const(fail)
          // Can also interpolate slopePoint on 2nd half, but I choose not to
          return constP(fail)
        }
        default:
          assertUnreachable(operation)
      }
    }
  )
  return poly.map((p) => expandPoly(p))
}

export type SumOfMonomials = Monomial[]
type Monomial = {
  $k: number
  terms: string[]
  setUsage: DynStat
}
function constM(v: number): Monomial {
  return { $k: v, terms: [], setUsage: {} }
}
function termM(term: Term): Monomial {
  const setUsage = term.artSet ? { [term.artSet.key]: term.artSet.thresh } : {}
  return { $k: 1, terms: [term.key], setUsage }
}
function sumM(...monomials: Monomial[][]): Monomial[] {
  return monomials.flat()
}
function prodM(...monomials: Monomial[][]): Monomial[] {
  monomials = monomials.map((mono) => foldLikeTerms(mono))
  const out = cartesian(...monomials).map((monos) =>
    monos.reduce(
      (ret, nxt) => {
        ret.$k *= nxt.$k
        ret.terms.push(...nxt.terms)
        Object.keys(nxt.setUsage).forEach(
          (k) =>
            (ret.setUsage[k] = Math.max(ret.setUsage[k] ?? 0, nxt.setUsage[k]))
        )
        return ret
      },
      { $k: 1, terms: [], setUsage: {} }
    )
  )
  return out.filter(
    ({ setUsage }) => Object.values(setUsage).reduce((a, b) => a + b, 0) <= 5
  )
}
function monomialCmp(
  { terms: t1, setUsage: s1 }: Monomial,
  { terms: t2, setUsage: s2 }: Monomial
): number {
  // Assumes all terms are sorted.
  if (t1.length !== t2.length) return t1.length - t2.length
  for (let i = 0; i < t1.length; i++)
    if (t1[i] !== t2[i]) return t1[i].localeCompare(t2[i]) ? -1 : +1

  return JSON.stringify(s1).localeCompare(JSON.stringify(s2))
}
function foldLikeTerms(mon: Monomial[]): Monomial[] {
  mon.forEach((m) => m.terms.sort())
  mon.sort(monomialCmp)

  for (let i = mon.length - 2; i >= 0; i--) {
    if (mon[i].$k === 0) {
      mon.splice(i, 1)
      continue
    }
    if (monomialCmp(mon[i], mon[i + 1]) === 0) {
      mon[i].$k = mon[i].$k + mon[i + 1].$k
      mon.splice(i + 1, 1)
    }
  }
  return mon.filter(({ $k }) => $k !== 0)
}
function expandPoly(node: PolynomialWithBounds): SumOfMonomials {
  function toExpandedPoly(n: PolynomialWithBounds): Monomial[] {
    switch (n.type) {
      case 'term':
        return [termM(n)]
      case 'const':
        return [constM(n.$c)]
      case 'sum':
        return sumM(...n.terms.map((t) => toExpandedPoly(t)), [constM(n.$c)])
      case 'prod':
        return prodM(...n.terms.map((t) => toExpandedPoly(t)), [constM(n.$k)])
    }
  }

  const expanded = toExpandedPoly(node)
  expanded.forEach((mon) => (mon.setUsage = {}))
  return foldLikeTerms(expanded)
}

class PolyError extends Error {
  constructor(cause: string, operation: string) {
    super(
      `Found ${cause} in ${operation} node when generating polynomial upper bound`
    )
  }
}
