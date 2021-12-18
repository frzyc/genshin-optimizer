
import { objectFromKeyMap } from "../Util/Util"
import type { ComputeNode, Data, DataNode, Node, Info, ReadNode, SubscriptNode, ConstantNode, StringNode, StringSubscriptNode, CommutativeMonoidOperation } from "./type"

export const todo: Node = { operation: "const", value: NaN, operands: [] }

export function stringConstant(value: string): StringNode {
  return { operation: "string", value, operands: [] }
}

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
/** list[index] */
export function stringSubscript(index: Node, list: Dict<string, Node>): StringSubscriptNode {
  return { operation: "stringSubscript", list, operands: [index] }
}

export function res(base: number | Node): ComputeNode {
  return { operation: "res", operands: intoOperands([base]) }
}

export function makeReaders<T extends ReaderSpecNode>(context: T, prefix: string[] = []): ReaderSpec<T, ReadNode> {
  return typeof context === "string"
    ? { operation: "read", accumulation: context, key: prefix, operands: [] }
    : objectFromKeyMap(Object.keys(context) as string[], key => makeReaders(context[key], [...prefix, key])) as any
}
export function data(baseFormula: Node, contexts: Data[]): DataNode {
  return { operation: "data", operands: [baseFormula], data: contexts }
}

function intoOperands(values: (number | Node)[]): Node[] {
  return values.map(value => typeof value === "number" ? { operation: "const", value, operands: [] } : value)
}

interface ReaderSpecInternal {
  [key: string]: typeof key extends "operation" ? undefined : ReaderSpecNode | CommutativeMonoidOperation | "unique"
}
export type ReaderSpecNode = ReaderSpecInternal | CommutativeMonoidOperation | "unique"
export type ReaderSpec<T extends ReaderSpecNode, X> = T extends ReaderSpecInternal ? {
  [Key in keyof T]: ReaderSpec<T[Key], X>
} : X
