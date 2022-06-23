import { constant, sum, prod } from "./utils"
import { ConstantNode, NumNode } from "./type"
import { allArtifactSets } from "../Types/consts"
import { cartesian } from '../Util/Util'
import { mapFormulas } from "./internal"

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
  if (constVal === 1) return prod(...nodes)
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
export function expandPoly(node: NumNode, isVar: (n: NumNode) => boolean) {
  let expanded = mapFormulas([node], n => n, f => {
    switch (f.operation) {
      case 'mul':
        let ops = f.operands.map(n => n.operation === 'add' ? n.operands : [n])
          .map((ns, i) => {
            const varExprs = ns.map(n => isVar(n) || (n.operation === 'mul' && n.operands.some(isVar)))
            let vars = ns.filter((n, i) => varExprs[i])
            let nonVars = ns.filter((n, i) => !varExprs[i])

            if (nonVars.length === 0) return vars
            return [...vars, foldSum(nonVars)]
          })
        const products = cartesian(...ops).map(ns => foldProd(ns))
        return foldSum(products)
      case 'add':
        let op2 = f.operands.flatMap(n => n.operation === 'add' ? n.operands : n)
        return foldSum(op2)
      default:
        return f
    }
  })[0]

  return expanded
}

/**
 * Assumes we've expanded the damage formula into sum-of-products form.
 * Prunes formulas that are unreachable due to not enough slots.
 */
export function productPossible(node: NumNode) {
  return countSlotUsage(node) <= 5
}

function countSlotUsage(node: NumNode) {
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

// function gatherSumOfProds(products: NumNode[], isVar: (n: NumNode) => boolean): NumNode[] {
  // return products
  // type NodeLinkedList = { n: NumNode, ix: number, next: NodeLinkedList | undefined }
  // let varMap = {} as Dict<number, NodeLinkedList> // my shitty hashmap
  // const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541]
  // let varCounter = 0
  // function lookup(n: NumNode) {
  //   let hsh = hashNode(n)
  //   let z = varMap[hsh]
  //   while (z !== undefined) {
  //     if (cmpNode(z.n, n)) return BigInt(z.ix)
  //     z = z.next
  //   }

  //   const ix = primes[varCounter]
  //   varMap[hsh] = { n, ix, next: varMap[hsh] }
  //   varCounter += 1
  //   return BigInt(ix)
  // }

  // let result: { [k: string]: { coeff: number, rhs: NumNode[] } } = {}
  // products.forEach(n => {
  //   if (n.operation === 'const') {
  //     result[1] = { coeff: n.value + (result[1]?.coeff ?? 0), rhs: [] }
  //     return
  //   }
  //   else if (isVar(n)) {
  //     let ix = lookup(n).toString()
  //     result[ix] = { coeff: 1 + (result[ix]?.coeff ?? 0), rhs: [n] }
  //     return
  //   }
  //   else if (n.operation === 'mul') {
  //     const { coeff, ix, ops } = n.operands.reduce(({ coeff, ix, ops }, n) => {
  //       if (n.operation === 'const') return { coeff: coeff * n.value, ix, ops }
  //       ops.push(n)
  //       return { coeff, ix: ix * lookup(n), ops: ops }
  //     }, { coeff: 1, ix: BigInt(1), ops: [] as NumNode[] })
  //     let ix2 = ix.toString()
  //     result[ix2] = { coeff: coeff + (result[ix2]?.coeff ?? 0), rhs: ops }
  //     return
  //   }
  //   console.log(n)
  //   throw Error('Encountered unexpected node in `gatherSumOfProds`')
  // })
  // return Object.entries(result).map(([k, { coeff, rhs }]) => {
  //   return foldProd([...rhs, constant(coeff)])
  // })
// }
