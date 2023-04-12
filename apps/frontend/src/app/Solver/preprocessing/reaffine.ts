import { ArtifactSetKey } from '@genshin-optimizer/consts'
import type { OptNode } from '../../Formula/optimization'
import { constant, customRead, prod, sum, threshold } from '../../Formula/utils'
import type { ArtifactsBySlot } from '../common'
import { mapFormulas } from '../../Formula/internal'

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

function canDistribute({ operation, operands }: OptNode): boolean {
  return (
    operation === 'const' ||
    operation === 'read' ||
    operation === 'threshold' ||
    (operation === 'add' && operands.every((n) => canDistribute(n)))
  )
}

export function reaffine2(nodes: OptNode[], arts: ArtifactsBySlot) {
  const allKeys = Object.keys(arts.base)
  const addedRegisters = {} as {
    [key: string]: { base: number; coeff: number; sumKeys: string[] }
  }

  function distributeConst(n: OptNode, v: number): OptNode {
    if (v === 1) return n
    switch (n.operation) {
      case 'threshold': {
        const [branch, bval, ge, lt] = n.operands
        return threshold(
          branch,
          bval,
          distributeConst(ge, v),
          distributeConst(lt, v)
        )
      }
      case 'const':
        return constant(n.value * v)
      case 'add':
        return sum(...n.operands.map((ni) => distributeConst(ni, v)))
      case 'read': {
        const newID = n.path[1] + '*'
        addedRegisters[newID] = { base: 0, coeff: v, sumKeys: [n.path[1]] }
        return customRead(['dyn', newID])
      }
      case 'mul': {
        const distrInto = n.operands.findIndex((n) => canDistribute(n))
        if (distrInto >= 0) {
          const newOps = [...n.operands]
          newOps[distrInto] = distributeConst(n.operands[distrInto], v)
          return foldProd(...newOps)
        }
        return foldProd(n, constant(v))
      }
      default:
        return prod(n, constant(v))
    }
  }

  console.log('Original:', JSON.stringify(nodes[0]))
  console.log('This should be bottom-up')
  const hmm = mapFormulas(
    nodes,
    (_) => _,
    (f) => {
      switch (f.operation) {
        case 'mul': {
          if (f.operands.every((ni) => ni.operation !== 'const')) return f
          const coeff = f.operands.reduce(
            (coeff, ni) =>
              ni.operation === 'const' ? coeff * ni.value : coeff,
            1
          )
          const todistrib = f.operands
            .filter((n) => n.operation !== 'const')
            .map((n) => distributeConst(n, coeff))
          if (todistrib.length === 1) return todistrib[0]
          return prod(...todistrib)
        }
        case 'add': {
          return f
        }
      }
      return f
    }
  )

  console.log(JSON.stringify(hmm[0]))
}
