import { crawlObject, deepClone, objPathValue } from "../Util/Util"
import { NodeData, NumNode, StrNode } from "./type"
import { constant } from "./utils"

type Node = NumNode | StrNode

export function deepNodeClone<T extends NodeData<NumNode | StrNode | undefined>>(data: T): T {
  const result = deepClone(data)
  // Restore `Info`
  crawlObject(result, [], n => n.operation, (node, path) =>
    node.info = { ...objPathValue(data, path).info })
  return result
}

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

export function customMapFormula<Context, Output>(formulas: NumNode[], context: Context, map: (formula: Node, context: Context, map: (node: NumNode, context: Context) => Output) => Output): Output[] {
  const contextMapping = new Map<Context, [Set<NumNode>, Map<NumNode, Output>]>()
  function internalMap(formula: NumNode, context: Context): Output {
    let current = contextMapping.get(context)
    if (!current) contextMapping.set(context, current = [new Set(), new Map()])
    const [visiting, mapping] = current

    const old = mapping.get(formula)
    if (old) return old

    if (visiting.has(formula))
      throw new Error("Found cyclical dependency during formula mapping")

    visiting.add(formula)
    const newFormula = map(formula, context, internalMap)
    mapping.set(formula, newFormula)
    visiting.delete(formula)

    return newFormula
  }
  return formulas.map(formula => internalMap(formula, context))
}

function arrayEqual<T>(a: readonly T[] | undefined, b: readonly T[] | undefined): boolean {
  if (a === undefined) return b === undefined
  if (b === undefined) return false

  return a.length === b.length && a.every((value, i) => value === b[i])
}
