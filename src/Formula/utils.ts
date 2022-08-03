
import { objectKeyMap } from "../Util/Util"
import type { AnyNode, Data, DataNode, Info, LookupNode, MatchNode, NumNode, ReadNode, StrNode, SubscriptNode } from "./type"

type Num = number | NumNode
type Str = string | undefined | StrNode
type Any = Num | Str

export const todo: NumNode = constant(NaN, { key: "TODO" })
export const one = percent(1), naught = percent(0)
export const none = constant("none")

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
export function res(base: Num): NumNode {
  return { operation: "res", operands: intoOps([base]) }
}

/** v1 == v2 ? eq : neq */
export function compareEq(v1: Num, v2: Num, eq: Num, neq: Num, info?: Info): MatchNode<NumNode, NumNode>
export function compareEq(v1: Num, v2: Num, eq: Str, neq: Str, info?: Info): MatchNode<NumNode, StrNode>
export function compareEq(v1: Str, v2: Str, eq: Num, neq: Num, info?: Info): MatchNode<StrNode, NumNode>
export function compareEq(v1: Str, v2: Str, eq: Str, neq: Str, info?: Info): MatchNode<StrNode, StrNode>
export function compareEq(v1: Num | Str, v2: Num | Str, eq: Num | Str, neq: Num | Str, info?: Info): MatchNode<NumNode | StrNode, NumNode | StrNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(eq), intoV(neq)], info }
}
/** v1 == v2 ? pass : 0 */
export function equal(v1: Num, v2: Num, pass: Num, info?: Info): MatchNode<NumNode, NumNode>
export function equal(v1: Str, v2: Str, pass: Num, info?: Info): MatchNode<StrNode, NumNode>
export function equal(v1: Num | Str, v2: Num | Str, pass: Num, info?: Info): MatchNode<NumNode | StrNode, NumNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(pass), intoV(0)], info, emptyOn: "unmatch" }
}
/** v1 == v2 ? pass : `undefined` */
export function equalStr(v1: Num, v2: Num, pass: Str, info?: Info): MatchNode<NumNode, StrNode>
export function equalStr(v1: Str, v2: Str, pass: Str, info?: Info): MatchNode<StrNode, StrNode>
export function equalStr(v1: Num | Str, v2: Num | Str, pass: Str, info?: Info): MatchNode<NumNode | StrNode, StrNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(pass), intoV(undefined)], info, emptyOn: "unmatch" }
}
/** v1 != v2 ? pass : 0 */
export function unequal(v1: Num, v2: Num, pass: Num, info?: Info): MatchNode<NumNode, NumNode>
export function unequal(v1: Str, v2: Str, pass: Num, info?: Info): MatchNode<StrNode, NumNode>
export function unequal(v1: Num | Str, v2: Num | Str, pass: Num, info?: Info): MatchNode<NumNode | StrNode, NumNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(0), intoV(pass)], info, emptyOn: "match" }
}
/** v1 != v2 ? pass : `undefined` */
export function unequalStr(v1: Num, v2: Num, pass: Str, info?: Info): MatchNode<NumNode, StrNode>
export function unequalStr(v1: Str, v2: Str, pass: Str, info?: Info): MatchNode<StrNode, StrNode>
export function unequalStr(v1: Num | Str, v2: Num | Str, pass: Str, info?: Info): MatchNode<NumNode | StrNode, StrNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(undefined), intoV(pass)], info, emptyOn: "match" }
}
/** v1 >= v2 ? pass : 0 */
export function greaterEq(v1: Num, v2: Num, pass: Num, info?: Info): NumNode
export function greaterEq(v1: Num, v2: Num, pass: Num, info?: Info): NumNode {
  const operands = [intoV(v1), intoV(v2), intoV(pass), intoV(0)] as any
  return { operation: "threshold", operands, info, emptyOn: "l" }
}
/** v1 >= v2 ? pass : `undefined` */
export function greaterEqStr(v1: Num, v2: Num, pass: Str, info?: Info): StrNode
export function greaterEqStr(v1: Num, v2: Num, pass: Str, info?: Info): NumNode | StrNode {
  const operands = [intoV(v1), intoV(v2), intoV(pass), intoV(undefined)] as any
  return { operation: "threshold", operands, info, emptyOn: "l" }
}
/** v1 < v2 ? pass : 0 */
export function lessThan(v1: Num, v2: Num, pass: Num, info?: Info): NumNode
export function lessThan(v1: Num, v2: Num, pass: Num | Str, info?: Info): NumNode | StrNode {
  const operands = [intoV(v1), intoV(v2), intoV(0), intoV(pass)] as any
  return { operation: "threshold", operands, info, emptyOn: "ge" }
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
/**
 * CAUTION: Use `prio` accumulation sparingly. WR don't assume the reading order, so the result may be unstable
 */
export function stringRead(accu?: ReadNode<string | undefined>["accu"]): ReadNode<string | undefined> {
  return { operation: "read", operands: [], path: [], accu, type: "string" }
}
export function stringPrio(...operands: Str[]): StrNode {
  return { operation: "prio", operands: intoOps(operands) }
}
/** list[index] */
export function subscript<V>(index: NumNode, list: V[], info?: Info): SubscriptNode<V> {
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

/**
 * `v1` === `v2` ? `match` : `unmatch`
 * @deprecated Use `equal`, `unequal`, `equalStr`, or `compareEq` instead
 */
export function matchFull(v1: Num, v2: Num, match: Num, unmatch: Num, info?: Info): MatchNode<NumNode, NumNode>
export function matchFull(v1: Num, v2: Num, match: Str, unmatch: Str, info?: Info): MatchNode<NumNode, StrNode>
export function matchFull(v1: Str, v2: Str, match: Num, unmatch: Num, info?: Info): MatchNode<StrNode, NumNode>
export function matchFull(v1: Str, v2: Str, match: Str, unmatch: Str, info?: Info): MatchNode<StrNode, StrNode>
export function matchFull(v1: Num | Str, v2: Num | Str, match: Num | Str, unmatch: Num | Str, info?: Info): MatchNode<NumNode | StrNode, NumNode | StrNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(match), intoV(unmatch)], info }
}
