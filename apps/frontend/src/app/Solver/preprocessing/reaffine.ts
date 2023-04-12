import { constant, customRead, prod, sum, threshold } from '../../Formula/utils'
import { forEachNodes, mapFormulas } from '../../Formula/internal'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import { objectKeyMap } from '../../Util/Util'
import type { ArtifactsBySlot, DynStat } from '../common'
import type { OptNode } from '../../Formula/optimization'

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

function deleteKey(a: ArtifactsBySlot, key: string) {
  delete a.base[key]
  a.values.flower.forEach((art) => delete art.values[key])
  a.values.plume.forEach((art) => delete art.values[key])
  a.values.sands.forEach((art) => delete art.values[key])
  a.values.goblet.forEach((art) => delete art.values[key])
  a.values.circlet.forEach((art) => delete art.values[key])
}
function canDistribute({ operation, operands }: OptNode): boolean {
  return (
    operation === 'const' ||
    operation === 'read' ||
    operation === 'threshold' ||
    (operation === 'add' && operands.every((n) => canDistribute(n)))
  )
}

/**
 * More powerful, but slower reaffine function. Modifies `arts` in-place, so use with moderate caution.
 * Added variables are prefixed with `~r`.
 *
 * Brings `800*atk_` => `~r1` or `atk + 800*atk_` => `~r2`
 */
export function slowReaffine(nodes: OptNode[], arts: ArtifactsBySlot) {
  const allKeys = new Set(Object.keys(arts.base))
  const addedRegisters = {} as {
    [key: string]: { base: number; coeff: number; sumKeys: string[] }
  }
  let nextRegNum = 0
  function addRegister(entry: {
    base: number
    coeff: number
    sumKeys: string[]
  }): OptNode {
    let name = `~r${nextRegNum++}`
    while (allKeys.has(name) || name in addedRegisters)
      name = `~r${nextRegNum++}`
    addedRegisters[name] = entry
    return customRead(['dyn', name])
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
        return addRegister({ base: 0, coeff: v, sumKeys: [n.path[1]] })
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
        return foldProd(n, constant(v))
    }
  }

  const reaffinedNodes = mapFormulas(
    nodes,
    (_) => _,
    (f) => {
      switch (f.operation) {
        case 'mul': {
          f = foldProd(...f.operands)
          if (f.operation !== 'mul') return f
          if (f.operands.every((ni) => ni.operation !== 'const')) return f
          const coeff = f.operands.reduce(
            (pv, ni) => (ni.operation === 'const' ? pv * ni.value : pv),
            1
          )
          const nonConst = f.operands.filter((n) => n.operation !== 'const')
          const retting = distributeConst(prod(...nonConst), coeff)
          return retting
        }
        case 'add': {
          f = foldSum(...f.operands)
          if (f.operation !== 'add') return f
          const reads = f.operands.filter((n) => n.operation === 'read')
          const names = reads.map((n) =>
            n.operation === 'read' ? n.path[1] : ''
          )
          const constVal = f.operands.reduce(
            (pv, n) => (n.operation === 'const' ? pv + n.value : pv),
            0
          )
          if (names.length === 0) return f

          const reg = addRegister({ base: constVal, coeff: 1, sumKeys: names })
          const remaining = f.operands.filter(
            ({ operation }) => operation !== 'read' && operation !== 'const'
          )
          if (remaining.length === 0) return reg
          return foldSum(...remaining, reg)
        }
      }
      return f
    }
  )

  // 2. Resolve all the `addedRegisters`
  const instKeys = new Set(Object.keys(arts.base))
  const resolveQueue = Object.entries(addedRegisters)
  while (resolveQueue.length > 0) {
    const [s, { base, coeff, sumKeys }] = resolveQueue.shift()!
    if (!sumKeys.every((k) => instKeys.has(k))) {
      resolveQueue.push([s, { base, coeff: coeff, sumKeys: sumKeys }])
      continue
    }
    const getV = (stats: DynStat) =>
      coeff * sumKeys.reduce((v, key) => v + (stats[key] ?? 0), 0)

    arts.base[s] = base + getV(arts.base)
    objectKeyMap(allArtifactSlotKeys, (slot) =>
      arts.values[slot].forEach((art) => {
        const val = getV(art.values)
        if (val !== 0) art.values[s] = val
      })
    )
    instKeys.add(s)
  }

  // 3. Remove all unused keys
  const unusedKeys = new Set<string>(instKeys)
  forEachNodes(
    reaffinedNodes,
    (_) => {},
    (n) => {
      if (n.operation === 'read') unusedKeys.delete(n.path[1])
    }
  )
  unusedKeys.forEach((k) => deleteKey(arts, k))
  return { arts, nodes: reaffinedNodes }
}
