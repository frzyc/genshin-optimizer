
import { objectFromKeyMap } from "../Util/Util"
import type { Data, DataNode, Info, Node, ReadNode, StringNode, StringReadNode } from "./type"

export const todo: Node = constant(NaN, { key: "TODO" })
export const unit = percent(1), naught = percent(0)

export function constant(value: number, info?: Info): Node {
  if (value === Number.MAX_VALUE) value = Infinity
  if (value === Number.MIN_VALUE) value = -Infinity
  return { operation: "const", operands: [], value, info }
}
/** `value` in percentage. The value is written as non-percentage, e.g., use `percent(1)` for 100% */
export function percent(value: number, info?: Info): Node {
  return constant(value, { key: "_", ...info })
}
/** Inject `info` to the node in-place */
export function infoMut(node: Node, info: Info): Node {
  if (info) node.info = { ...node.info, ...info }
  return node
}
/** `string1` === `string2` ? `match` : 0 */
export function match(string1: StringNode, string2: string | undefined | StringNode, node: number | Node, info?: Info): Node {
  return { operation: "match", operands: intoOperands([node]), string1, string2: intoString(string2), info }
}
/** `string1` !== `string2` ? `match` : 0 */
export function unmatch(string1: StringNode, string2: string | undefined | StringNode, node: number | Node, info?: Info): Node {
  return { operation: "unmatch", operands: intoOperands([node]), string1, string2: intoString(string2), info }
}
/** `table[string] ?? defaultNode` */
export function lookup(string: StringNode, table: Dict<string, Node>, defaultNode: number | Node | undefined, info?: Info): Node {
  return { operation: "lookup", operands: defaultNode !== undefined ? intoOperands([defaultNode]) : [], string, table, info }
}

/** min( x1, x2, ... ) */
export function min(...values: (number | Node)[]): Node {
  return { operation: "min", operands: intoOperands(values) }
}
/** max( x1, x2, ... ) */
export function max(...values: (number | Node)[]): Node {
  return { operation: "max", operands: intoOperands(values) }
}
/** x1 + x2 + ... */
export function sum(...values: (number | Node)[]): Node {
  return { operation: "add", operands: intoOperands(values) }
}
/** x1 * x2 * ... */
export function prod(...values: (number | Node)[]): Node {
  return { operation: "mul", operands: intoOperands(values) }
}
/** x / (x + c) */
export function frac(x: number | Node, c: number | Node): Node {
  return { operation: "sum_frac", operands: intoOperands([x, c]) }
}
/** value >= threshold ? addition : 0 */
export function threshold_add(value: number | Node, threshold: number | Node, addition: number | Node, info?: Info): Node {
  return { operation: "threshold_add", operands: intoOperands([value, threshold, addition]), info }
}
/** list[index] */
export function subscript(index: Node, list: number[], info?: Info): Node {
  if (list.some((value, i, array) => i !== 0 && array[i - 1] > value))
    // We use this fact primarily for *diffing*
    throw new Error("Formula Construction Failure: subscription list must be sorted in ascending order")
  return { operation: "subscript", operands: [index], list, info }
}

export function res(base: number | Node): Node {
  return { operation: "res", operands: intoOperands([base]) }
}

export function setReadNodeKeys<T extends NodeList>(nodeList: T, prefix: string[] = []): T {
  if (nodeList.operation) {
    if (nodeList.operation !== "read" && nodeList.operation !== "sread")
      throw new Error(`Found ${(nodeList as any).operation} node while making reader`)
    return { ...nodeList, path: prefix }
  } else {
    return objectFromKeyMap(Object.keys(nodeList), key =>
      setReadNodeKeys(nodeList[key], [...prefix, key])) as any
  }
}
export function customRead(path: string[], info?: Info): ReadNode {
  return { operation: "read", operands: [], path, accumulation: "unique", info }
}
export function read(accumulation: ReadNode["accumulation"], info?: Info): ReadNode {
  return { operation: "read", operands: [], path: [], accumulation, info }
}
export function data(baseFormula: Node, data: Data): DataNode {
  return { operation: "data", operands: [baseFormula], data }
}
export function resetData(baseFormula: Node, data: Data): DataNode {
  return { operation: "data", operands: [baseFormula], data, reset: true }
}

export function stringConst(value: string | undefined): StringNode {
  return intoString(value)
}
export function customStringRead(path: string[]): StringReadNode {
  return { operation: "sread", operands: [], path }
}
export function stringRead(): StringReadNode {
  return { operation: "sread", operands: [], path: [] }
}
export function stringPrio(...operands: (string | StringNode)[]): StringNode {
  return { operation: "prio", operands: operands.map(intoString) }
}
export function stringMatch(string1: StringNode, string2: string | undefined | StringNode, match: string | undefined | StringNode, unmatch: string | undefined | StringNode): StringNode {
  return { operation: "smatch", operands: [string1, string2, match, unmatch].map(intoString) }
}
/** `table[string] ?? defaultNode` */
export function stringLookup(string: StringNode, table: Dict<string, StringNode>, defaultNode?: string | StringNode): StringNode {
  return { operation: "slookup", operands: [string, intoString(defaultNode)], table }
}


function intoOperands(values: (number | Node)[]): Node[] {
  return values.map(value => typeof value === "number" ? constant(value) : value)
}
function intoString(value: string | StringNode | undefined): StringNode {
  return (!value || typeof value === "string") ? { operation: "sconst", operands: [], value } : value
}

type _NodeList = {
  [key: string]: NodeList
} & {
  operation?: never
}
type NodeList = _NodeList | ReadNode | StringReadNode
