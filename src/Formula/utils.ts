
import { objectFromKeyMap } from "../Util/Util"
import type { ComputeNode, Data, DataNode, Info, InputNode, Node, ReadNode, StringNode, SubscriptNode } from "./type"

export const todo: Node = { operation: "const", value: NaN, operands: [] }

/** min( x1, x2, ... ) */
export function min(...values: (number | Node)[]): ComputeNode {
  return { operation: "min", operands: intoOperands(values) }
}
/** max( x1, x2, ... ) */
export function max(...values: (number | Node)[]): ComputeNode {
  return { operation: "max", operands: intoOperands(values) }
}
/** x1 + x2 + ... */
export function sum(...values: (number | Node)[]): ComputeNode {
  return { operation: "add", operands: intoOperands(values) }
}
/** x1 * x2 * ... */
export function prod(...values: (number | Node)[]): ComputeNode {
  return { operation: "mul", operands: intoOperands(values) }
}
/** x / (x + c) */
export function frac(x: number | Node, c: number | Node): ComputeNode {
  return { operation: "sum_frac", operands: intoOperands([x, c]) }
}
/** value >= threshold ? addition : 0 */
export function threshold_add(value: number | Node, threshold: number | Node, addition: number | Node): ComputeNode {
  return { operation: "threshold_add", operands: intoOperands([value, threshold, addition]) }
}
/** list[index] */
export function subscript(index: Node, list: number[], info?: Info): SubscriptNode {
  if (list.some((value, i, array) => i !== 0 && array[i - 1] > value))
    // We use this fact primarily for *diffing*
    throw new Error("Formula Construction Failure: subscription list must be sorted in ascending order")
  return { operation: "subscript", operands: [index], list, info }
}

export function res(base: number | Node): ComputeNode {
  return { operation: "res", operands: intoOperands([base]) }
}

export function setReadNodeKeys<T extends NodeList>(nodeList: T, prefix: string[] = []): T {
  if (nodeList.operation) {
    if (nodeList.operation !== "read")
      throw new Error(`Found ${nodeList.operation} node while making reader`)
    return { ...nodeList, key: prefix }
  } else {
    return objectFromKeyMap(Object.keys(nodeList), key =>
      setReadNodeKeys(nodeList[key], [...prefix, key])) as any
  }
}
export function read(accumulation: ReadNode["accumulation"], info?: Info, suffix?: StringNode): ReadNode {
  return { operation: "read", operands: [], key: [], accumulation, info, suffix }
}
export function data(baseFormula: Node, contexts: Data[]): DataNode {
  return { operation: "data", operands: [baseFormula], data: contexts }
}

export function input(key: InputNode["key"], info?: Info): InputNode {
  return { operation: "input", operands: [], key, info }
}

function intoOperands(values: (number | Node)[]): Node[] {
  return values.map(value => typeof value === "number" ? { operation: "const", value, operands: [] } : value)
}

type _NodeList = {
  [key: string]: NodeList
} & {
  operation?: never
}
type NodeList = _NodeList | Node
