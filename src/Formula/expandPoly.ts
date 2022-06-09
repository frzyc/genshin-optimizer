import { constant, sum, prod } from "./utils"
import { ConstantNode, NumNode } from "./type"
import { allArtifactSets } from "../Types/consts"
import { cartesian } from '../Util/Util'

export function foldSum(nodes: NumNode[]) {
  if (nodes.length === 1) return nodes[0]

  nodes = nodes.flatMap(n => n.operation === 'add' ? n.operands : n)
  let constVal = nodes.reduce((pv, n) => n.operation === 'const' ? pv + n.value : pv, 0)
  nodes = nodes.filter(n => n.operation !== 'const')
  if (nodes.length === 0) return constant(constVal)
  if (constVal === 0) return sum(...nodes)
  return sum(...nodes, constant(constVal))
}

export function foldProd(nodes: NumNode[]) {
  if (nodes.length === 1) return nodes[0]

  nodes = nodes.flatMap(n => n.operation === 'mul' ? n.operands : n)
  let constVal = nodes.reduce((pv, n) => n.operation === 'const' ? pv * n.value : pv, 1)
  nodes = nodes.filter(n => n.operation !== 'const')

  if (nodes.length === 0) return constant(constVal)
  if (constVal === 0) return sum(...nodes)
  return prod(...nodes, constant(constVal))
}

/**
 * Factors damage formula into pure polynomials of each variable.
 * For example:  (1700 * atk_ + atk) * (1 + cr * cd) * (1 + sum_frac(EM))
 *   -> 1700 * atk_ + 1700 * atk_ * cr * cd + 1700 * atk_ * sum_frac(EM) + 1700 * atk_ * cr * cd * sum_frac(EM)
 *            + atk +         atk * cr * cd +         atk * sum_frac(EM) +         atk * cr * cd * sum_frac(EM)
 *
 * For a total of 8 terms, since there are 3 pairs of additions, for 2^3 sum-of-product terms.
 *
 * isVar() is used to check whether any node should be considered a variable on its own.
 */
export function expandPoly(node: NumNode, isVar: (n: NumNode) => boolean): NumNode {
  switch (node.operation) {
    case 'mul':
      let ops = node.operands.map(n => expandPoly(n, isVar))
        .map(n => n.operation === 'add' ? n.operands : [n])
        .map((ns, i) => {
          const varExprs = ns.map(n => isVar(n) || (n.operation === 'mul' && n.operands.some(isVar)))
          let vars = ns.filter((n, i) => varExprs[i])
          let nonVars = ns.filter((n, i) => !varExprs[i])

          if (nonVars.length === 0) return vars
          return [...vars, foldSum(nonVars)]
        })

      const products = cartesian(...ops).map(ns => foldProd(ns))

      // TODO: Look for like factors and add their coefficients together
      return foldSum(products)

    case 'add':
      let newOps = node.operands.map(n => expandPoly(n, isVar))
        .flatMap(n => n.operation === 'add' ? n.operands : n)

      // TODO: Look for like factors and add their coefficients together
      return foldSum(newOps)

    default:
      return node
  }
}

/**
 * Assumes we've expanded the damage formula into sum-of-products form.
 * Prunes formulas that are unreachable due to not enough slots.
 */
export function productPossible(node: NumNode) {
  // TODO: fix me? This might be over-eager currently.
  return countSlotUsage(node) <= 5
}

export function countSlotUsage(node: NumNode) {
  if (node.operation === 'add') {
    return Math.min(...node.operands.map(n => countSlotUsage(n)))
  }
  else if (node.operation === 'mul') {
    return node.operands.map(n => countSlotUsage(n)).reduce((a, b) => a + b)
  }
  else if (node.operation === 'threshold') {
    const branch = node.operands[0]
    if (branch.operation === 'read' && (allArtifactSets as readonly string[]).includes(branch.path[1])) {
      let con = node.operands[1] as ConstantNode<number>
      return con.value
    }
  }
  return 0
}
