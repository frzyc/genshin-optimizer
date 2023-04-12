import { OptNode } from "../../Formula/optimization"
import { constant, prod, sum } from "../../Formula/utils"

/**
 * Smart product between nodes, where constants and nestings are automatically merged.
 *
 * Runtime is recursive and potentially redundant. Only use with pre-processing.
 *
 * @example
 * prod(x1, c1, c2, prod(x2, x3, c3))  ->  prod(x1, x2, x3, c1*c2*c3)
 * prod(x1, 8, 0.25, 0.5)              ->  x1
 * prod(prod(prod(x1)))                ->  x1
 * prod(c1, c2)                        ->  constant(c1*c2)
 * prod()                              ->  constant(1)
 */
export function foldProd(...nodes: readonly OptNode[]): OptNode {
  if (nodes.length === 1) {
    if (nodes[0].operation === 'mul') return foldProd(...nodes[0].operands)
    return nodes[0]
  }
  nodes = nodes.flatMap((n) => {
    if (n.operation !== 'mul') return n
    n = foldProd(...n.operands)
    return n.operation === 'mul' ? n.operands : n
  })
  const constVal = nodes.reduce(
    (pv, n) => (n.operation === 'const' ? pv * n.value : pv),
    1
  )
  nodes = nodes.filter((n) => n.operation !== 'const')

  if (nodes.length === 0) return constant(constVal)
  if (constVal === 1 && nodes.length === 1) return nodes[0]
  if (constVal === 1) return prod(...nodes)
  return prod(...nodes, constant(constVal))
}

/**
 * Smart sum of nodes, where constants and nestings are automatically merged.
 *
 * Runtime is recursive and potentially redundant. Only use with pre-processing.
 *
 * @example
 * sum(x1, c1, c2, sum(x2, x3, c3))  ->  sum(x1, x2, x3, c1+c2+c3)
 * sum(x1, 2, -2, 0)                 ->  x1
 * sum(sum(sum(x1)))                 ->  x1
 * sum(c1, c2)                       ->  constant(c1+c2)
 * sum()                             ->  constant(1)
 */
export function foldSum(...nodes: readonly OptNode[]): OptNode {
  if (nodes.length === 1) {
    if (nodes[0].operation === 'add') return foldSum(...nodes[0].operands)
    return nodes[0]
  }
  nodes = nodes.flatMap((n) => {
    if (n.operation !== 'add') return n
    n = foldSum(...n.operands)
    return n.operation === 'add' ? n.operands : n
  })
  const constVal = nodes.reduce(
    (pv, n) => (n.operation === 'const' ? pv + n.value : pv),
    0
  )
  nodes = nodes.filter((n) => n.operation !== 'const')

  if (nodes.length === 0) return constant(constVal)
  if (constVal === 0 && nodes.length === 1) return nodes[0]
  if (constVal === 0) return sum(...nodes)
  return sum(...nodes, constant(constVal))
}
