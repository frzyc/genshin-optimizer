
import { objectFromKeyMap } from "../Util/Util"
import type { Data, DataNode, Info, Node, ReadNode, StringNode, StringReadNode } from "./type"

export const todo: Node = { operation: "const", value: NaN, operands: [], info: { key: "TODO" } }

/** `value` in percentage. The value is written as non-percentage, e.g., use `percent(1)` for 100% */
export function percent(value: number, info?: Info): Node {
  return { operation: "const", operands: [], value, info: { key: "_", ...info } }
}
/** Add `info` to the node */
export function info(node: Node, info: Info): Node {
  node.info = { ...node.info, ...info }
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
export function lookup(string: StringNode, table: Dict<string, Node>, defaultNode?: number | Node, info?: Info): Node {
  return { operation: "lookup", operands: defaultNode ? intoOperands([defaultNode]) : [], string, table, info }
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
export function data(baseFormula: Node, contexts: Data[]): DataNode {
  return { operation: "data", operands: [baseFormula], data: contexts }
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

function intoOperands(values: (number | Node)[]): Node[] {
  return values.map(value => typeof value === "number" ? { operation: "const", value, operands: [] } : value)
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
