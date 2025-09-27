// Simplify nodes by removing zero-derivative substats
// Then de-duplicate identical nodes (same substats and rolls distributions)
// TODO: actually do this.
// Algorithm idea: Define sort order over nodes, then merge equivalent nodes by adding their probabilities.

import type { DynStat } from '@genshin-optimizer/gi/solver'
import type {
  MarkovNode,
  Objective,
  RollsLevelNode,
  SubstatLevelNode,
  ValuesLevelNode,
} from './upOpt.types'

type weightedNode = { p: number; n: MarkovNode }
/**
 * Deduplicate nodes by merging identical nodes and summing their probabilities.
 * Note: modifies input nodes in place.
 */
export function deduplicate(
  obj: Objective,
  nodes: weightedNode[]
): weightedNode[] {
  nodes.forEach(({ n }) => {
    if (n.type === 'substat') simplifySubstatNode(obj, n)
    else if (n.type === 'rolls') simplifyRollsNode(obj, n)
  })
  nodes.sort((a, b) => -cmpNodes(a.n, b.n))
  let prev: weightedNode | undefined = undefined
  return nodes.filter((cur) => {
    if (prev && cmpNodes(prev.n, cur.n) === 0) {
      prev.p += cur.p
      return false
    }
    prev = cur
    return true
  })
}

function simplifySubstatNode(obj: Objective, node: SubstatLevelNode) {
  const toRemove = node.subkeys.map(({ key }) => obj.zeroDeriv.includes(key))
  node.subkeys = node.subkeys.filter((_, i) => !toRemove[i])
  node.subDistr.subs = node.subDistr.subs.filter((_, i) => !toRemove[i])
  node.subDistr.mu = node.subDistr.mu.filter((_, i) => !toRemove[i])
  node.subDistr.cov = node.subDistr.cov.filter((_, i) => !toRemove[i])
  node.subDistr.cov = node.subDistr.cov.map((row) =>
    row.filter((_, i) => !toRemove[i])
  )
}

function simplifyRollsNode(obj: Objective, node: RollsLevelNode) {
  const toRemove = node.subs.map(
    ({ key, rolls }) => obj.zeroDeriv.includes(key) || rolls === 0
  )
  node.subs = node.subs.filter((_, i) => !toRemove[i])
  node.subDistr.subs = node.subDistr.subs.filter((_, i) => !toRemove[i])
  node.subDistr.mu = node.subDistr.mu.filter((_, i) => !toRemove[i])
  node.subDistr.cov = node.subDistr.cov.filter((_, i) => !toRemove[i])
  node.subDistr.cov = node.subDistr.cov.map((row) =>
    row.filter((_, i) => !toRemove[i])
  )
}

function cmpNodes(a: MarkovNode, b: MarkovNode): number {
  if (a.type === 'substat') {
    if (b.type !== 'substat') return -1
    return cmpSubstatNode(a, b)
  }
  if (a.type === 'rolls') {
    if (b.type === 'substat') return 1
    if (b.type === 'values') return -1
    return cmpRollsNode(a, b)
  }
  if (b.type !== 'values') return 1
  return cmpValuesNode(a, b)
}

function cmpBase(a: DynStat, b: DynStat): number {
  const keysA = Object.keys(a).sort()
  const keysB = Object.keys(b).sort()
  if (keysA.length !== keysB.length) return keysA.length - keysB.length
  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return keysA[i].localeCompare(keysB[i])
    if (a[keysA[i]] !== b[keysB[i]]) return a[keysA[i]] - b[keysB[i]]
  }
  return 0
}

function cmpValuesNode(a: ValuesLevelNode, b: ValuesLevelNode): number {
  return cmpBase(a.subDistr.base, b.subDistr.base)
}

function cmpSubstatNode(a: SubstatLevelNode, b: SubstatLevelNode): number {
  if (a.rarity !== b.rarity) return a.rarity - b.rarity
  if (a.rollsLeft !== b.rollsLeft) return a.rollsLeft - b.rollsLeft
  if (a.reshape && !b.reshape) return -1
  if (!a.reshape && b.reshape) return 1
  if (a.reshape && b.reshape) {
    if (a.reshape.mintotal !== b.reshape.mintotal)
      return a.reshape.mintotal - b.reshape.mintotal
    if (a.reshape.affixes.length !== b.reshape.affixes.length)
      return a.reshape.affixes.length - b.reshape.affixes.length
    for (let i = 0; i < a.reshape.affixes.length; i++) {
      if (a.reshape.affixes[i] !== b.reshape.affixes[i])
        return a.reshape.affixes[i].localeCompare(b.reshape.affixes[i])
    }
  }
  if (a.subkeys.length !== b.subkeys.length)
    return a.subkeys.length - b.subkeys.length
  for (let i = 0; i < a.subkeys.length; i++) {
    if (a.subkeys[i].key !== b.subkeys[i].key)
      return a.subkeys[i].key.localeCompare(b.subkeys[i].key)
    if (a.subkeys[i].baseRolls !== b.subkeys[i].baseRolls)
      return a.subkeys[i].baseRolls - b.subkeys[i].baseRolls
  }
  return cmpBase(a.base, b.base)
}

function cmpRollsNode(a: RollsLevelNode, b: RollsLevelNode): number {
  if (a.rarity !== b.rarity) return a.rarity - b.rarity
  if (a.subs.length !== b.subs.length) return a.subs.length - b.subs.length
  for (let i = 0; i < a.subs.length; i++) {
    if (a.subs[i].key !== b.subs[i].key)
      return a.subs[i].key.localeCompare(b.subs[i].key)
    if (a.subs[i].rolls !== b.subs[i].rolls)
      return a.subs[i].rolls - b.subs[i].rolls
  }
  return cmpBase(a.base, b.base)
}
