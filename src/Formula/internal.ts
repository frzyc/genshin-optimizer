import { AnyNode, NumNode, StrNode } from "./type"
import { constant } from "./utils"

export function forEachNodes(formulas: (NumNode | StrNode)[], topDown: (formula: (NumNode | StrNode)) => void, bottomUp: (formula: (NumNode | StrNode)) => void): void {
  const visiting = new Set<(NumNode | StrNode)>(), visited = new Set<(NumNode | StrNode)>()

  function traverse(formula: (NumNode | StrNode)) {
    if (visited.has(formula)) return

    if (visiting.has(formula)) {
      console.error("Found cyclical dependency during formula traversal")
      return
    }
    visiting.add(formula)

    topDown(formula)

    formula.operands.forEach(traverse)

    bottomUp(formula)

    visiting.delete(formula)
    visited.add(formula)
  }

  formulas.forEach(traverse)
}

export function mapFormulas(formulas: NumNode[], topDownMap: (formula: (NumNode | StrNode)) => (NumNode | StrNode), bottomUpMap: (current: (NumNode | StrNode), orig: (NumNode | StrNode)) => (NumNode | StrNode)): NumNode[]
export function mapFormulas(formulas: (NumNode | StrNode)[], topDownMap: (formula: (NumNode | StrNode)) => (NumNode | StrNode), bottomUpMap: (current: (NumNode | StrNode), orig: (NumNode | StrNode)) => (NumNode | StrNode)): (NumNode | StrNode)[] {
  const visiting = new Set<(NumNode | StrNode)>()
  const topDownMapped = new Map<(NumNode | StrNode), (NumNode | StrNode)>()
  const bottomUpMapped = new Map<(NumNode | StrNode), (NumNode | StrNode)>()

  function check(formula: (NumNode | StrNode)): (NumNode | StrNode) {
    let topDown = topDownMapped.get(formula)
    if (topDown) return topDown
    topDown = topDownMap(formula)

    let bottomUp = bottomUpMapped.get(topDown)
    if (bottomUp) return bottomUp

    if (visiting.has(topDown)) {
      console.error("Found cyclical dependency during formula mapping")
      return constant(NaN)
    }
    visiting.add(topDown)

    bottomUp = bottomUpMap(traverse(topDown), formula)

    visiting.delete(topDown)

    topDownMapped.set(formula, bottomUp)
    bottomUpMapped.set(topDown, bottomUp)
    return bottomUp
  }

  function traverse(formula: (NumNode | StrNode)): (NumNode | StrNode) {
    const operands = formula.operands.map(check)
    return arrayEqual(operands, formula.operands) ? formula : { ...formula, operands } as any
  }

  const result = formulas.map(check)
  return arrayEqual(result, formulas) ? formulas : result
}

export function mapContextualFormulas(formulas: NumNode[], baseContextId: number, topDownMap: (formula: AnyNode, contextId: ContextID) => [AnyNode, ContextID], bottomUpMap: (formula: AnyNode, orig: AnyNode, contextId: ContextID, origContextId: ContextID) => AnyNode): NumNode[]
export function mapContextualFormulas(formulas: AnyNode[], baseContextId: number, topDownMap: (formula: AnyNode, contextId: ContextID) => [AnyNode, ContextID], bottomUpMap: (formula: AnyNode, orig: AnyNode, contextId: ContextID, origContextId: ContextID) => AnyNode): AnyNode[] {
  const visiting = new Set<AnyNode>()
  const topDownByContext = new Map<ContextID, Map<AnyNode, AnyNode>>()
  const bottomUpByContext = new Map<ContextID, Map<AnyNode, AnyNode>>()

  function check(formula: AnyNode, parentContextId: ContextID): AnyNode {
    let topDownMapping = topDownByContext.get(parentContextId)
    if (!topDownMapping) {
      topDownMapping = new Map()
      topDownByContext.set(parentContextId, topDownMapping)
    }

    let topDown = topDownMapping.get(formula)
    if (topDown) return topDown
    let topDownContextId: number
    [topDown, topDownContextId] = topDownMap(formula, parentContextId)

    if (visiting.has(topDown)) {
      console.error("Found cyclical dependency during formula mapping")
      return constant(NaN)
    }

    let bottomUpMapping = bottomUpByContext.get(topDownContextId)
    if (!bottomUpMapping) {
      bottomUpMapping = new Map()
      bottomUpByContext.set(topDownContextId, bottomUpMapping)
    }

    let bottomUp = bottomUpMapping.get(topDown)
    if (bottomUp) return bottomUp

    visiting.add(topDown)
    bottomUp = bottomUpMap(traverse(topDown, topDownContextId), formula, topDownContextId, parentContextId)
    visiting.delete(topDown)

    bottomUpMapping.set(topDown, bottomUp)
    topDownMapping.set(formula, bottomUp)
    return bottomUp
  }

  function traverse(formula: AnyNode, contextId: ContextID): AnyNode {
    const operands = formula.operands.map(f => check(f, contextId))
    return arrayEqual(operands, formula.operands) ? formula : { ...formula, operands }
  }

  const result = formulas.map(f => check(f, baseContextId))
  return arrayEqual(formulas, result) ? formulas : result
}

type ContextID = number

function arrayEqual<T>(a: readonly T[] | undefined, b: readonly T[] | undefined): boolean {
  if (a === undefined) return b === undefined
  if (b === undefined) return false

  return a.length === b.length && a.every((value, i) => value === b[i])
}
