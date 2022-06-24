import { NumNode } from "./type"
import { ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { constant, sum, prod, cmp } from "./utils"
import { foldSum, foldProd, expandPoly, ExpandedPolynomial, Monomial, sumM, prodM, constantM, readM, foldLikeTerms } from './expandPoly'
import { precompute, allOperations } from "./optimization"
import { solveLP } from './solveLP_simplex'
import { cartesian } from '../Util/Util'
import { fillBuffer } from "./addedUtils"
import { forEachNodes } from "./internal"

export type LinearForm = {
  w: DynStat,
  c: number,
  err: number
}

function minMax(node: NumNode, lower: DynStat, upper: DynStat) {
  let [compute, mapping, buffer] = precompute([node], n => n.path[1])
  fillBuffer(lower, mapping, buffer)
  const minval = compute()[0]
  fillBuffer(upper, mapping, buffer)
  const maxval = compute()[0]
  return [minval, maxval]
}

/**
 * `res` is the ONE place where negative arguments & negative slopes are allowed.
 * @param node
 */
function handleResArg(node: { 'operation': 'res', 'operands': NumNode[] }, lower: DynStat, upper: DynStat) {
  function flipOps(n: NumNode): NumNode {
    switch (n.operation) {
      case 'add':
        return sum(...n.operands.map(n => flipOps(n)))
      case 'const':
        return constant(-n.value)
      case 'threshold':
        const [branch, bval, ge, lt] = n.operands
        if (ge.operation === 'const' && lt.operation === 'const') {
          if (ge.value <= lt.value) {
            return cmp(branch, bval, -ge.value, -lt.value)
          }
        }
        console.log(n)
        throw Error('(res neg slope): threshold. Something went wrong.')
      default:
        console.log(n)
        throw Error('(res neg slope) Havent written logic to handle this')
    }
  }

  const flippedResOp = flipOps(node.operands[0])

  let [a, b] = minMax(flippedResOp, lower, upper)
  let resf = allOperations['res']
  let [c, d] = [resf([-a]), resf([-b])]

  if (b > 0 && a > -1.75) {
    // 1 + x / 2
    return sum(1, prod(.5, flippedResOp))
  }

  const intercept = (b * c - a * d) / (b - a)
  const slope = (c - d) / (b - a)
  return sum(intercept, prod(slope, flippedResOp))
}

export function toLinearUpperBound2({ nodes, terms }: ExpandedPolynomial, lower: DynStat, upper: DynStat): LinearForm {
  let stat2tag = {} as Dict<string, string>
  Object.entries(nodes).forEach(([tag, n]) => {
    if (n.operation === 'read') stat2tag[n.path[1]] = tag
  })

  let linerr = 0
  function toPureRead(n: NumNode): Monomial[] {
    switch (n.operation) {
      case 'const':
        return constantM(n.value)
      case 'read':
        return readM(stat2tag[n.path[1]]!)
      case 'add':
        return sumM(...n.operands.map(toPureRead))
      case 'mul':
        return prodM(...n.operands.map(toPureRead))

      case 'threshold':
        const [branch, bval, ge, lt] = n.operands
        if (branch.operation === 'read' && bval.operation === 'const'
          && lt.operation === 'const' && ge.operation === 'const') {
          if (ge.value < lt.value) {
            console.log(n)
            throw Error('Not Implemented (threshold must be increasing)')
          }

          let key = branch.path[1]
          if (lower[key] >= bval.value) return constantM(ge.value)
          if (upper[key] < bval.value) return constantM(lt.value)

          const slope = (ge.value - lt.value) / (bval.value - lower[key])
          const mon1 = prodM(constantM(slope), readM(stat2tag[branch.path[1]]!))
          if (lt.value === 0) return mon1
          return sumM(constantM(lt.value), mon1)
        }
        console.log(n)
        throw Error('Not Implemented (threshold must branch between constants)')
      case 'res':
        let op = handleResArg(n as { 'operation': 'res', 'operands': NumNode[] }, lower, upper)
        op = expandPoly(op, n => n.operation !== 'const')
        return toPureRead(op)

      case 'min': case 'max':
        let [rop, cop] = n.operands
        if (cop.operation !== 'const')
          [rop, cop] = [cop, rop]  // Assume min(const, read)
        if (n.operation === 'min') return toPureRead(rop)

        if (cop.operation === 'const') {
          const thresh = cop.value
          const [minVal, maxVal] = minMax(rop, lower, upper)
          if (minVal > thresh) return toPureRead(rop)
          if (thresh > maxVal) return constantM(thresh)

          // rescale `rop` to be above thresh, since max(f, 0) is a convex function
          const m = (maxVal - thresh) / (maxVal - minVal)
          const b = thresh - minVal
          return sumM(constantM(b), prodM(constantM(m), toPureRead(rop)))
        }
        console.log(n)
        throw Error('Not Implemented (max between two non-constants)')

      case 'sum_frac':
        const [em, denom] = n.operands
        if (denom.operation !== 'const') throw Error('Not Implemented (non-constant sum_frac denominator)')

        const [minEM, maxEM] = minMax(em, lower, upper)
        const k = denom.value
        // The sum_frac form is concave, so any Taylor expansion of EM / (EM + k) gives an upper bound.
        // We can solve for the best Taylor approximation location with the following formula.
        let loc = Math.sqrt((minEM + k) * (maxEM + k)) - k
        let below = (k + loc) * (k + loc)
        let slope = k / below
        let c = loc * loc / below

        // TODO: update linerr
        return sumM(constantM(c), prodM(constantM(slope), toPureRead(em)))

      default:
        console.log(n)
        throw Error('Not Implemented')
    }
  }

  // 1. Turn all nodes into linear upper bounds
  const nodesToMap = Object.fromEntries(Object.entries(nodes).filter(([tag, n]) => n.operation !== 'read').map(([tag, n]) => [tag, toPureRead(n)]))

  // 2. substitute into `terms` and construct a new SOPForm whose nodes are all pure read nodes
  let t2 = terms.flatMap(({ coeff, terms }) => prodM(constantM(coeff), ...terms.map(t => nodesToMap[t] ?? readM(t))))
  t2 = foldLikeTerms(t2)

  // 2.5 Re-name all the tags to their read node version
  t2 = t2.map(({ coeff, terms }) => {
    terms = terms.map(t => {
      const nt = nodes[t]
      if (!nt || nt.operation !== 'read') throw Error('MUST be a read node.')
      return nt.path[1]
    })
    return { coeff, terms }
  })

  // 3. call lub() on each term
  const lins = t2.map(({ coeff, terms }) => {
    if (terms.length === 0) return { w: {}, c: coeff, err: 0 }
    if (terms.length === 1) return { w: { [terms[0]]: coeff }, c: 0, err: 0 }
    const { w, c, err } = lub(terms.map(k => ({ lower: lower[k], upper: upper[k] })))
    const retw = w.reduce((ret, wi, i) => {
      ret[terms[i]] = wi * coeff + (ret[terms[i]] ?? 0)
      return ret
    }, {} as DynStat)
    return { w: retw, c: coeff * c, err: coeff * err + linerr }
  })

  return lins.reduce((lin, l) => {
    lin.c += l.c; lin.err += l.err
    Object.entries(l.w).forEach(([k, v]) => lin.w[k] = v + (lin.w[k] ?? 0))
    return lin
  }, { w: {}, c: 0, err: 0 })
}

/**
 * First converts a product of variables (including max, min, sum_frac, threshold, etc.) to
 *   a pure product form consisting of only `read` and `const` nodes, guaranteeing the
 *   product form is an upper bound.
 *
 * Then on the product form, create a linear upper bound using `lub` and return it.
 *
 * @param node The formula to expand
 * @param lower Stat lower bounds
 * @param upper Stat upper bounds
 * @returns
 */
export function toLinearUpperBound(node: NumNode, lower: DynStat, upper: DynStat): LinearForm | LinearForm[] {
  let linerr = 0

  // Converts threshold(Glad) * ATK * min(CR, 1) => Glad * ATK * CR
  // Also updates lower & upper limits to respect min, max, threshold.
  // TODO: track linearization error for threshold(), min(), max(), sum_frac() nodes
  function purePolyForm(node: NumNode) {
    switch (node.operation) {
      case 'const': case 'read':
        return node
      case 'add':
        return foldSum(node.operands.map(n => purePolyForm(n)))
      case 'mul':
        return foldProd(node.operands.map(n => purePolyForm(n)))
      case 'threshold':
        const [branch, bval, ge, lt] = node.operands
        if (branch.operation === 'read'
          && bval.operation === 'const' && lt.operation === 'const' && ge.operation === 'const') {
          let key = branch.path[1]
          if (lower[key] >= bval.value) return constant(ge.value)
          if (upper[key] < bval.value) return constant(lt.value)

          if (ge.value < lt.value) {
            console.log(node)
            throw Error('Not Implemented (threshold must be increasing)')
          }

          const slope = (ge.value - lt.value) / bval.value
          // u[key] = bval.value
          // TODO: update linerr
          return sum(lt.value, prod(slope, branch))
        }
        console.log(node)
        throw Error('Not Implemented (threshold must branch between constants)')
      case 'res':
        let op = handleResArg(node as { 'operation': 'res', 'operands': NumNode[] }, lower, upper)
        op = expandPoly(op, n => n.operation !== 'const')
        return purePolyForm(op)

      case 'min':
        let [rop, cop] = node.operands
        if (cop.operation !== 'const')
          [rop, cop] = [cop, rop]  // Assume min(const, read)

        // TODO: update linerr
        // If it's not a simple min() node, returning either value is still UB.
        return purePolyForm(rop)

      case 'max':
        let [varop, constop] = node.operands
        if (constop.operation !== 'const')
          [varop, constop] = [constop, varop]

        if (cop.operation === 'const') {
          const thresh = cop.value
          const [minVal, maxVal] = minMax(varop, lower, upper)
          if (minVal > thresh) return varop
          if (thresh > maxVal) return constant(thresh)

          // rescale `varop` to be above thresh.
          let m = (maxVal - thresh) / (maxVal - minVal)
          let b = thresh - minVal
          return sum(prod(m, purePolyForm(varop)), b)
        }
        console.log(node)
        throw Error('Not Implemented (max)')

      case 'sum_frac':
        const [em, denom] = node.operands
        if (denom.operation !== 'const') throw Error('Not Implemented (non-constant sum_frac denominator)')

        const [minEM, maxEM] = minMax(em, lower, upper)
        const k = denom.value
        // The sum_frac form is concave, so any Taylor expansion of EM / (EM + k) gives an upper bound.
        // We can solve for the best Taylor approximation location with the following formula.
        let loc = Math.sqrt((minEM + k) * (maxEM + k)) - k
        let below = (k + loc) * (k + loc)
        let slope = k / below
        let c = loc * loc / below

        // TODO: update linerr
        return purePolyForm(sum(c, prod(slope, em)))
      default:
        console.log(node)
        throw Error('Not Implemented')
    }
  }

  // `lpf` *should* be a product of read() and const() nodes. Maybe a sum of these products.
  const lpf = expandPoly(purePolyForm(node), n => n.operation !== 'const')
  if (lpf.operation === 'const')
    return { w: {} as DynStat, c: lpf.value, err: linerr }

  function toLUB(n: NumNode) {
    if (n.operation === 'read') {
      return { w: { [n.path[1]]: 1 }, c: 0, err: 0 }
    }
    if (n.operation === 'const') {
      return { w: {}, c: n.value, err: 0 }
    }
    if (n.operation !== 'mul') {
      console.log(n)
      throw Error('toLUB takes only mul nodes.')
    }
    let coeff = 1
    // TODO: handle duplicity in the vars
    const vars = n.operands.reduce((vars, op) => {
      if (op.operation === 'read') vars.push(op.path[1])
      if (op.operation === 'const') coeff *= op.value
      return vars
    }, [] as string[])
    const bounds = vars.map(v => ({ lower: lower[v], upper: upper[v] }))
    const { w, c, err } = lub(bounds)

    const retw = w.reduce((ret, wi, i) => {
      ret[vars[i]] = wi * coeff + (ret[vars[i]] ?? 0)
      return ret
    }, {} as DynStat)
    return { w: retw, c: c * coeff, err: err * coeff + linerr }
  }

  if (lpf.operation === 'add') return lpf.operands.map(n => toLUB(n))
  return toLUB(lpf)
}

/**
 * Constructs an upper bounding linear form for a function x_1 * x_2 * ... * x_n
 * @param bounds upper and lower bounds for each x_i
 * @returns { w, c, err } with
 */
function lub(bounds: { lower: number, upper: number }[]): { w: number[], c: number, err: number } {
  if (bounds.length === 0) return { w: [], c: 0, err: 0 }
  const nVar = bounds.length

  // Re-scale bounds to [0, 1] for numerical stability.
  const boundScale = bounds.map(({ upper }) => upper)
  const scaleProd = boundScale.reduce((prod, v) => prod * v, 1)
  bounds = bounds.map(({ lower, upper }) => ({ lower: lower / upper, upper: 1 }))

  // Setting up the linear program in terms of constraints.
  let cons = cartesian(...bounds.map(({ lower, upper }) => [lower, upper])).flatMap((coords) => {
    const prod = coords.reduce((prod, v) => prod * v, 1)
    return [
      [...coords.map(v => -v), 1, 0, -prod],
      [...coords, -1, -1, prod],
    ]
  })

  // Force equality at upper & lower corners?
  // cons.push([...bounds.map(lu => lu.lower), -1, 0, bounds.reduce((prod, { lower }) => prod * lower, 1)])
  // cons.push([...bounds.map(lu => lu.upper), -1, 0, bounds.reduce((prod, { upper }) => prod * upper, 1)])

  let soln: any
  const objective = [...bounds.map(_ => 0), 0, 1]
  try {
    // TODO: verify solution
    soln = solveLP(objective, cons)
  }
  catch (e) {
    console.log('ERROR on bounds', bounds)
    console.log('Possibly numerical instability issue.')
    throw e
  }
  return {
    w: soln.slice(0, nVar).map((wi, i) => wi * scaleProd / boundScale[i]),
    c: -scaleProd * soln[nVar],
    err: scaleProd * soln[nVar + 1]
  }
}

export function maxWeight(a: ArtifactsBySlot, lin: LinearForm) {
  const baseVal = sparseMatmul([lin], [a.base])[0][0] + lin.c

  return baseVal + Object.entries(a.values).reduce((maxTotVal, [slotKey, slotArts]) => {
    const wArts = sparseMatmul([lin], slotArts.map(a => a.values)).map(v => v[0])
    return maxTotVal + Math.max(...wArts)
  }, 0)
}


// Implement matrix multiply between row-major w's of LinearForm and col-major DynStats that represent artifacts.
/**
 * Implements sparse matrix multiplication between A and x
 * @param A A list of row-major w's of some LinearForm
 * @param x A list of col-major DynStats that represent some artifacts
 * @returns A col-major 2d array number[][] with shape (A.length, x.length).
 *          ret[0] is [A1 @ x1, A2 @ x1, ..., An @ x1]
 */
export function sparseMatmul(A: LinearForm[], x: DynStat[]) {
  return x.map(dyn => A.map(({ w }) => Object.entries(w).reduce((a, [k, wk]) => a + wk * (dyn[k] ?? 0), 0)))
}
