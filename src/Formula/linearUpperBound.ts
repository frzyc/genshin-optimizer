import { AnyNode, ComputeNode, ConstantNode, NumNode, ReadNode } from "./type"
import { ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/background"
import { constant, sum, prod, cmp, res } from "./utils"
import { foldSum, foldProd, expandPoly } from './expandPoly'
import { precompute, allOperations, optimize } from "./optimization"
import { solveLP } from './solveLP_simplex'
import { cartesian } from '../Util/Util'

export type LinearForm = {
  w: DynStat,
  c: number,
  err: number
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
  if (node.operation !== 'mul') {
    throw Error('toLUB should only operate on product forms')
  }

  let l = { ...lower }
  let u = { ...upper }
  let linerr = 0

  // Converts threshold(Glad) * ATK * min(CR, 1) => Glad * ATK * CR
  // Also updates lower & upper limits to respect min, max, threshold.
  // TODO: track linearization error for threshold(), min(), max(), sum_frac() nodes
  function pureProductForm(node: NumNode) {
    switch (node.operation) {
      case 'const': case 'read':
        return node
      case 'add':
        return foldSum(node.operands.map(n => pureProductForm(n)))
      case 'mul':
        return foldProd(node.operands.map(n => pureProductForm(n)))
      case 'threshold':
        const [branch, bval, ge, lt] = node.operands
        if (branch.operation === 'read'
          && bval.operation === 'const' && lt.operation === 'const' && ge.operation === 'const') {
          let key = branch.path[1]
          if (lower[key] >= bval.value) return constant(ge.value)
          if (upper[key] < bval.value) return constant(lt.value)

          const slope = (ge.value - lt.value) / bval.value
          u[key] = bval.value
          // TODO: update linerr
          return sum(lt.value, prod(slope, branch))
        }
        throw Error('Not Implemented (threshold)')
      case 'res':
        const op = node.operands[0]
        if (op.operation === 'read') {
          if (l[op.path[1]] === u[op.path[1]]) {
            return constant(allOperations['res']([l[op.path[1]]]))
          }
          throw Error('res non constant!?')
        }
        throw Error('Not Implemented (res)')
      case 'min':
        let [rop, cop] = node.operands
        if (cop.operation !== 'const')
          [rop, cop] = [cop, rop]  // Assume min(const, read)

        if (rop.operation === 'read' && cop.operation === 'const') {
          if (cop.value < u[rop.path[1]]) {
            // TODO: update linerr
            u[rop.path[1]] = cop.value
          }
          return rop
        }

        // TODO: update linerr
        // If it's not a simple min() node, returning either value is still UB.
        return rop
      case 'max':
        throw Error('Not Implemented (max)')
      case 'sum_frac':
        const [em, denom] = node.operands
        if (denom.operation !== 'const') throw Error('Not Implemented (non-constant sum_frac denominator)')

        let emPath = ''
        if (em.operation === 'read')
          emPath = em.path[1]
        else if (em.operation === 'add') {
          // Works only with EM = EM + threshold(wanderer's) for now.
          em.operands.forEach(op => {
            if (op.operation === 'read') emPath = op.path[1]
          })
        }
        else {
          throw Error('EM depends on no stat...')
        }

        const [minEM, maxEM] = [lower[emPath], upper[emPath]]  // TODO: fix this to account for wanderer's
        const k = denom.value
        // The sum_frac form is concave, so any Taylor expansion of EM / (EM + k) gives an upper bound.
        // We can solve for the best Taylor approximation location with the following formula.
        let loc = Math.sqrt((minEM + k) * (maxEM + k)) - k
        let slope = k / (k + loc) / (k + loc)
        let c = loc * loc / (k + loc) / (k + loc)

        // TODO: update linerr
        return pureProductForm(sum(c, prod(slope, em)))
      default:
        console.log(node)
        throw Error('Not Implemented')
    }
  }

  // `lpf` *should* be a product of read() and const() nodes. Maybe a sum of these products.
  const lpf = expandPoly(pureProductForm(node), n => n.operation !== 'const')
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
    const vars = n.operands.reduce((vars, op) => {
      if (op.operation === 'read') vars.push(op.path[1])
      if (op.operation === 'const') coeff *= op.value
      return vars
    }, [] as string[])
    const bounds = vars.map(v => ({ lower: lower[v], upper: upper[v] }))
    const { w, c, err } = lub(bounds)
    return { w: Object.fromEntries(w.map((wi, i) => [vars[i], wi * coeff])), c: c * coeff, err: err * coeff + linerr }
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
  if (bounds.length == 0) return { w: [], c: 0, err: 0 }
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
  // console.log(cons)

  let soln: any
  const objective = [...bounds.map(_ => 0), 0, 1]
  try {
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
