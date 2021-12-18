import { Node, Info } from "./type"

export function forEachNodes(formulas: Node[], topDown: (formula: Node) => void, bottomUp: (formula: Node) => void) {
  const visiting = new Set<Node>(), visited = new Set<Node>()

  function traverse(formula: Node) {
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

export function mapFormulas(formulas: Node[], topDownMap: (formula: Node) => Node, bottomUpMap: (current: Node, orig: Node) => Node): Node[] {
  const visiting = new Set<Node>()
  const topDownMapped = new Map<Node, Node>()
  const bottomUpMapped = new Map<Node, Node>()

  function check(formula: Node): Node {
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

  function traverse(formula: Node): Node {
    const operands = formula.operands.map(check)
    return arrayEqual(operands, formula.operands) ? formula : { ...formula, operands }
  }

  return formulas.map(check)
}

export function mapContextualFormulas(formulas: Node[], topDownMap: (formula: Node, contextId: ContextID) => [Node, ContextID], bottomUpMap: (formula: Node, orig: Node, contextId: ContextID, origContextId: ContextID) => Node): Node[] {
  const visiting = new Set<Node>()
  const topDownByContext = new Map<ContextID, Map<Node, Node>>()
  const bottomUpByContext = new Map<ContextID, Map<Node, Node>>()

  function check(formula: Node, parentContextId: ContextID): Node {
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

  function traverse(formula: Node, contextId: ContextID): Node {
    const operands = formula.operands.map(f => check(f, contextId))
    return arrayEqual(operands, formula.operands) ? formula : { ...formula, operands }
  }

  return formulas.map(f => check(f, 0))
}

type ContextID = number

export function constant(value: number, info?: Info): Node {
  return { operation: "const", value, info, operands: [] }
}

function arrayEqual<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  if (a === undefined) return b === undefined
  if (b === undefined) return false

  return a.length === b.length && a.every((value, i) => value === b[i])
}
