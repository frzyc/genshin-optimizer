
import { objectKeyMap } from "../Util/Util"
import type { AnyNode, Data, DataNode, Info, LookupNode, MatchNode, NumNode, ReadNode, StrNode, SubscriptNode } from "./type"

type Num = number | NumNode
type Str = string | undefined | StrNode
type Any = Num | Str

export const todo: NumNode = constant(NaN, { key: "TODO" })
export const unit = percent(1), naught = percent(0)

export function constant(value: number, info?: Info): NumNode
export function constant(value: string | undefined, info?: Info): StrNode
export function constant(value: number | string | undefined, info?: Info): AnyNode
export function constant(value: number | string | undefined, info?: Info): AnyNode {
  return { operation: "const", operands: [], value, info }
}
/** `value` in percentage. The value is written as non-percentage, e.g., `percent(1)` for 100% */
export function percent(value: number, info?: Info): NumNode {
  if (value >= Number.MAX_VALUE / 100) value = Infinity
  if (value <= -Number.MAX_VALUE / 100) value = -Infinity
  return constant(value, { key: "_", ...info })
}
/** Inject `info` to the node in-place */
export function infoMut(node: NumNode, info: Info): NumNode
export function infoMut(node: StrNode, info: Info): StrNode
export function infoMut(node: NumNode | StrNode, info: Info): NumNode | StrNode {
  if (info) node.info = { ...node.info, ...info }
  return node
}
/** `v1` === `v2` ? `match` : 0 */
export function match(v1: Str, v2: Str, match: Num, info?: Info): NumNode {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(match), intoV(0)], info, emptyOn: "unmatch" }
}
/** `v1` === `v2` ? 0 : `unmatch` */
export function unmatch(v1: Str, v2: Str, unmatch: Num, info?: Info): NumNode {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(0), intoV(unmatch)], info, emptyOn: "match" }
}
/** `v1` === `v2` ? `match` : `unmatch` */
export function matchStr(v1: Str, v2: Str, match: Str, unmatch: Str, info?: Info): MatchNode<StrNode, StrNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(match), intoV(unmatch)], info }
}

/** `table[string] ?? defaultNode` */
export function lookup(index: StrNode, table: Dict<string, NumNode>, defaultV: Num | "none", info?: Info): NumNode
export function lookup(index: StrNode, table: Dict<string, StrNode>, defaultV: Str | "none", info?: Info): StrNode
export function lookup(index: StrNode, table: Dict<string, AnyNode>, defaultV: Any | "none", info?: Info): LookupNode<any> {
  const operands = defaultV !== "none" ? [intoV(index), intoV(defaultV)] as const : [intoV(index)] as const
  return { operation: "lookup", operands, table, info }
}

/** min( x1, x2, ... ) */
export function min(...values: Num[]): NumNode {
  return { operation: "min", operands: intoOps(values) }
}
/** max( x1, x2, ... ) */
export function max(...values: Num[]): NumNode {
  return { operation: "max", operands: intoOps(values) }
}
/** x1 + x2 + ... */
export function sum(...values: Num[]): NumNode {
  return { operation: "add", operands: intoOps(values) }
}
/** x1 * x2 * ... */
export function prod(...values: Num[]): NumNode {
  return { operation: "mul", operands: intoOps(values) }
}
/** x / (x + c) */
export function frac(x: Num, c: Num): NumNode {
  return { operation: "sum_frac", operands: intoOps([x, c]) }
}
/** value >= threshold ? addition : 0 */
export function threshold_add(value: Num, thres: Num, addition: Num, info?: Info): NumNode {
  return threshold(value, thres, addition, 0, info)
}
/** value >= threshold ? value : emptyValue */
export function threshold(value: Num, threshold: Num, pass: Str, fail: Str, info?: Info): StrNode
export function threshold(value: Num, threshold: Num, pass: Num, fail: Num, info?: Info): NumNode
export function threshold(value: Num, threshold: Num, pass: Num | Str, fail: Num | Str, info?: Info): NumNode | StrNode {
  const operands = [intoV(value), intoV(threshold), intoV(pass), intoV(fail)] as any
  return { operation: "threshold", operands, info }
}
export function res(base: Num): NumNode {
  return { operation: "res", operands: intoOps([base]) }
}

export function setReadNodeKeys<T extends NodeList>(nodeList: T, prefix: string[] = []): T {
  if (nodeList.operation) {
    if (nodeList.operation !== "read")
      throw new Error(`Found ${(nodeList as any).operation} node while making reader`)
    return { ...nodeList, path: prefix }
  } else {
    return objectKeyMap(Object.keys(nodeList), key =>
      setReadNodeKeys(nodeList[key], [...prefix, key])) as any
  }
}
export function data(base: NumNode, data: Data): DataNode<NumNode>
export function data(base: StrNode, data: Data): DataNode<StrNode>
export function data(base: NumNode | StrNode, data: Data): DataNode<NumNode> | DataNode<StrNode>
export function data(base: AnyNode, data: Data): DataNode<AnyNode> {
  return { operation: "data", operands: [base], data }
}
export function resetData(base: NumNode, data: Data, info?: Info): NumNode
export function resetData(base: StrNode, data: Data, info?: Info): StrNode
export function resetData(base: NumNode | StrNode, data: Data, info?: Info): DataNode<NumNode | StrNode>
export function resetData(base: AnyNode, data: Data, info?: Info): DataNode<any> {
  return { operation: "data", operands: [base], data, reset: true, info }
}


export function customRead(path: readonly string[], info?: Info): ReadNode<number> {
  return { operation: "read", operands: [], path, info, type: "number" }
}
export function customStringRead(path: readonly string[]): ReadNode<string> {
  return { operation: "read", operands: [], path, type: "string" }
}
export function read(accu?: ReadNode<number>["accu"], info?: Info): ReadNode<number> {
  return { operation: "read", operands: [], path: [], accu, info, type: "number" }
}
export function stringRead(): ReadNode<string | undefined> {
  return { operation: "read", operands: [], path: [], type: "string" }
}
export function stringPrio(...operands: Str[]): StrNode {
  return { operation: "prio", operands: intoOps(operands) }
}
/** list[index] */
export function subscript<V>(index: NumNode, list: V[], info?: Info): SubscriptNode<V> {
  if (typeof list[0] === "number" && list.some((value, i, array) => i !== 0 && array[i - 1] > value))
    // We use this fact primarily for *diffing*
    throw new Error("Formula Construction Failure: subscription list must be sorted in ascending order")
  return { operation: "subscript", operands: [index], list, info }
}

function intoOps(values: Num[]): NumNode[]
function intoOps(values: Str[]): StrNode[]
function intoOps(values: Any[]): AnyNode[]
function intoOps(values: Any[]): AnyNode[] {
  return values.map(value => typeof value === "object" ? value : constant(value))
}
function intoV(value: Num): NumNode
function intoV(value: Str): StrNode
function intoV(value: Num | Str): NumNode | StrNode
function intoV(value: Any): AnyNode {
  return (typeof value !== "object") ? constant(value) : value
}

type _NodeList = {
  [key: string]: NodeList
} & {
  operation?: never
}
type NodeList = _NodeList | ReadNode<number> | ReadNode<string>
