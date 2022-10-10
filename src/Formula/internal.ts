import { NumNode, StrNode } from "./type"
import { constant } from "./utils"

type Node = NumNode | StrNode

export function forEachNodes(formulas: Node[], topDown: (formula: Node) => void, bottomUp: (formula: Node) => void): void {
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

export function mapFormulas(formulas: NumNode[], topDownMap: (formula: Node) => Node, bottomUpMap: (current: Node, orig: Node) => Node): NumNode[]
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
    return arrayEqual(operands, formula.operands) ? formula : { ...formula, operands } as any
  }

  const result = formulas.map(check)
  return arrayEqual(result, formulas) ? formulas : result
}

export function mapContextualFormulas<Context>(formulas: NumNode[], baseContext: Context, topDownMap: (formula: Node, context: Context) => [Node, Context], bottomUpMap: (formula: Node, orig: Node, context: Context, origContext: Context) => Node): NumNode[]
export function mapContextualFormulas<Context>(formulas: Node[], baseContext: Context, topDownMap: (formula: Node, context: Context) => [Node, Context], bottomUpMap: (formula: Node, orig: Node, context: Context, origContext: Context) => Node): Node[] {
  const visiting = new Set<Node>()
  const topDownByContext = new Map<Context, Map<Node, Node>>()
  const bottomUpByContext = new Map<Context, Map<Node, Node>>()

  function check(formula: Node, parentContext: Context): Node {
    let topDownMapping = topDownByContext.get(parentContext)
    if (!topDownMapping) {
      topDownMapping = new Map()
      topDownByContext.set(parentContext, topDownMapping)
    }

    let topDown = topDownMapping.get(formula)
    if (topDown) return topDown
    let topDownContext: Context
    [topDown, topDownContext] = topDownMap(formula, parentContext)

    if (visiting.has(topDown)) {
      console.error("Found cyclical dependency during formula mapping")
      return constant(NaN)
    }

    let bottomUpMapping = bottomUpByContext.get(topDownContext)
    if (!bottomUpMapping) {
      bottomUpMapping = new Map()
      bottomUpByContext.set(topDownContext, bottomUpMapping)
    }

    let bottomUp = bottomUpMapping.get(topDown)
    if (bottomUp) return bottomUp

    visiting.add(topDown)
    bottomUp = bottomUpMap(traverse(topDown, topDownContext), formula, topDownContext, parentContext)
    visiting.delete(topDown)

    bottomUpMapping.set(topDown, bottomUp)
    topDownMapping.set(formula, bottomUp)
    return bottomUp
  }

  function traverse(formula: Node, context: Context): Node {
    const operands = formula.operands.map(f => check(f, context))
    return arrayEqual(operands, formula.operands) ? formula : { ...formula, operands } as any
  }

  const result = formulas.map(f => check(f, baseContext))
  return arrayEqual(formulas, result) ? formulas : result
}

function arrayEqual<T>(a: readonly T[] | undefined, b: readonly T[] | undefined): boolean {
  if (a === undefined) return b === undefined
  if (b === undefined) return false

  return a.length === b.length && a.every((value, i) => value === b[i])
}
