
import { objectKeyMap } from "../Util/Util"
import type { OptNode } from "./optimization"
import type { ComputeNode, ConstantNode, Data, DataNode, Info, LookupNode, MatchNode, NumNode, ReadNode, StrNode, StrPrioNode, SubscriptNode, ThresholdNode } from "./type"

type Opt = number | OptNode
type Num = number | NumNode
type Str = string | undefined | StrNode
type N_S = Num | Str
type AnyNode = NumNode | StrNode

export const todo: OptNode = constant(NaN, { name: "TODO" })
export const one = percent(1), naught = percent(0)
export const none = constant("none")

export function constant(value: number, info?: Info): ConstantNode<number>
export function constant(value: string | undefined, info?: Info): ConstantNode<string | undefined>
export function constant(value: number | string | undefined, info?: Info): ConstantNode<number> | ConstantNode<string | undefined>
export function constant(value: number | string | undefined, info?: Info): ConstantNode<number | string | undefined> {
  return typeof value === "number"
    ? { operation: "const", operands: [], type: "number", value, info }
    : { operation: "const", operands: [], type: "string", value, info }
}
/** `value` in percentage. The value is written as non-percentage, e.g., `percent(1)` for 100% */
export function percent(value: number, info?: Info): ConstantNode<number> {
  if (value >= Number.MAX_VALUE / 100) value = Infinity
  if (value <= -Number.MAX_VALUE / 100) value = -Infinity
  return constant(value, { unit: "%", ...info })
}
/** Inject `info` to the node in-place */
export function infoMut(node: OptNode, info: Info): OptNode
export function infoMut(node: NumNode, info: Info): NumNode
export function infoMut(node: StrNode, info: Info): StrNode
export function infoMut(node: AnyNode, info: Info): AnyNode {
  if (info) node.info = { ...node.info, ...info }
  return node
}

/** `table[string] ?? defaultNode` */
export function lookup(index: StrNode, table: Dict<string, NumNode>, defaultV: Num | "none", info?: Info): LookupNode<NumNode>
export function lookup(index: StrNode, table: Dict<string, StrNode>, defaultV: Str | "none", info?: Info): LookupNode<StrNode>
export function lookup(index: StrNode, table: Dict<string, AnyNode>, defaultV: N_S | "none", info?: Info): LookupNode<AnyNode> {
  const operands = defaultV !== "none" ? [intoV(index), intoV(defaultV)] as const : [intoV(index)] as const
  return { operation: "lookup", operands, table, info }
}

/** min( x1, x2, ... ) */
export function min(...values: Opt[]): ComputeNode<OptNode, OptNode>
export function min(...values: Num[]): ComputeNode
export function min(...values: Num[]): ComputeNode {
  return { operation: "min", operands: intoOps(values) }
}
/** max( x1, x2, ... ) */
export function max(...values: Opt[]): ComputeNode<OptNode, OptNode>
export function max(...values: Num[]): ComputeNode
export function max(...values: Num[]): ComputeNode {
  return { operation: "max", operands: intoOps(values) }
}
/** x1 + x2 + ... */
export function sum(...values: Opt[]): ComputeNode<OptNode, OptNode>
export function sum(...values: Num[]): ComputeNode
export function sum(...values: Num[]): ComputeNode {
  return { operation: "add", operands: intoOps(values) }
}
/** x1 * x2 * ... */
export function prod(...values: Opt[]): ComputeNode<OptNode, OptNode>
export function prod(...values: Num[]): ComputeNode
export function prod(...values: Num[]): ComputeNode {
  return { operation: "mul", operands: intoOps(values) }
}
/** x / (x + c) */
export function frac(x: Opt, c: Opt): ComputeNode<OptNode, OptNode>
export function frac(x: Num, c: Num): ComputeNode
export function frac(x: Num, c: Num): ComputeNode {
  return { operation: "sum_frac", operands: intoOps([x, c]) }
}
export function res(base: Opt): ComputeNode<OptNode, OptNode>
export function res(base: Num): ComputeNode
export function res(base: Num): ComputeNode {
  return { operation: "res", operands: intoOps([base]) }
}

/** v1 == v2 ? eq : neq */
export function compareEq(v1: Num, v2: Num, eq: Num, neq: Num, info?: Info): MatchNode<NumNode>
export function compareEq(v1: Num, v2: Num, eq: Str, neq: Str, info?: Info): MatchNode<StrNode>
export function compareEq(v1: Str, v2: Str, eq: Num, neq: Num, info?: Info): MatchNode<NumNode>
export function compareEq(v1: Str, v2: Str, eq: Str, neq: Str, info?: Info): MatchNode<StrNode>
export function compareEq(v1: N_S, v2: N_S, eq: N_S, neq: N_S, info?: Info): MatchNode<AnyNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(eq), intoV(neq)], info }
}
/** v1 == v2 ? pass : 0 */
export function equal(v1: Num, v2: Num, pass: Num, info?: Info): MatchNode<NumNode>
export function equal(v1: Str, v2: Str, pass: Num, info?: Info): MatchNode<NumNode>
export function equal(v1: N_S, v2: N_S, pass: Num, info?: Info): MatchNode<NumNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(pass), intoV(0)], info, emptyOn: "unmatch" }
}
/** v1 == v2 ? pass : `undefined` */
export function equalStr(v1: Num, v2: Num, pass: Str, info?: Info): MatchNode<StrNode>
export function equalStr(v1: Str, v2: Str, pass: Str, info?: Info): MatchNode<StrNode>
export function equalStr(v1: N_S, v2: N_S, pass: Str, info?: Info): MatchNode<StrNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(pass), intoV(undefined)], info, emptyOn: "unmatch" }
}
/** v1 != v2 ? pass : 0 */
export function unequal(v1: Num, v2: Num, pass: Num, info?: Info): MatchNode<NumNode>
export function unequal(v1: Str, v2: Str, pass: Num, info?: Info): MatchNode<NumNode>
export function unequal(v1: N_S, v2: N_S, pass: Num, info?: Info): MatchNode<NumNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(0), intoV(pass)], info, emptyOn: "match" }
}
/** v1 != v2 ? pass : `undefined` */
export function unequalStr(v1: Num, v2: Num, pass: Str, info?: Info): MatchNode<StrNode>
export function unequalStr(v1: Str, v2: Str, pass: Str, info?: Info): MatchNode<StrNode>
export function unequalStr(v1: N_S, v2: N_S, pass: Str, info?: Info): MatchNode<StrNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(undefined), intoV(pass)], info, emptyOn: "match" }
}
/** v1 >= v2 ? pass : 0 */
export function greaterEq(v1: Opt, v2: Opt, pass: Opt, info?: Info): ThresholdNode<OptNode, OptNode, OptNode>
export function greaterEq(v1: Num, v2: Num, pass: Num, info?: Info): ThresholdNode<NumNode>
export function greaterEq(v1: Num, v2: Num, pass: Num, info?: Info): ThresholdNode<NumNode> {
  const operands = [intoV(v1), intoV(v2), intoV(pass), intoV(0)] as any
  return { operation: "threshold", operands, info, emptyOn: "l" }
}
/** v1 >= v2 ? pass : `undefined` */
export function greaterEqStr(v1: Num, v2: Num, pass: Str, info?: Info): ThresholdNode<StrNode> {
  const operands = [intoV(v1), intoV(v2), intoV(pass), intoV(undefined)] as any
  return { operation: "threshold", operands, info, emptyOn: "l" }
}
/** v1 < v2 ? pass : 0 */
export function lessThan(v1: Opt, v2: Opt, pass: Opt, info?: Info): ThresholdNode<OptNode, OptNode, OptNode>
export function lessThan(v1: Num, v2: Num, pass: Num, info?: Info): ThresholdNode<NumNode>
export function lessThan(v1: Num, v2: Num, pass: Num, info?: Info): ThresholdNode<NumNode> {
  const operands = [intoV(v1), intoV(v2), intoV(0), intoV(pass)] as any
  return { operation: "threshold", operands, info, emptyOn: "ge" }
}
/** v1 >= v2 ? ge : le */
export function threshold(v1: Opt, v2: Opt, ge: Opt, le: Opt, info?: Info): OptNode
export function threshold(v1: Num, v2: Num, ge: Num, le: Num, info?: Info): NumNode
export function threshold(v1: Num, v2: Num, ge: Num, le: Num, info?: Info): NumNode {
  return { operation: "threshold", operands: intoOps([v1, v2, ge, le]) as any, info }
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
export function data(base: AnyNode, data: Data): DataNode<NumNode> | DataNode<StrNode>
export function data(base: AnyNode, data: Data): DataNode<NumNode> | DataNode<StrNode> {
  return { operation: "data", operands: [base as any], data }
}
export function resetData(base: NumNode, data: Data, info?: Info): DataNode<NumNode>
export function resetData(base: StrNode, data: Data, info?: Info): DataNode<StrNode>
export function resetData(base: AnyNode, data: Data, info?: Info): DataNode<AnyNode>
export function resetData(base: AnyNode, data: Data, info?: Info): DataNode<AnyNode> {
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
export function stringPrio(...operands: Str[]): StrPrioNode {
  return { operation: "prio", operands: intoOps(operands) }
}
/** list[index] */
export function subscript<V>(index: NumNode, list: V[], info?: Info): SubscriptNode<V> {
  return { operation: "subscript", operands: [index], list, info }
}

function intoOps(values: Num[]): NumNode[]
function intoOps(values: Str[]): StrNode[]
function intoOps(values: N_S[]): AnyNode[] {
  return values.map(value => typeof value === "object" ? value : constant(value))
}
function intoV(value: Num): NumNode
function intoV(value: Str): StrNode
function intoV(value: N_S): AnyNode
function intoV(value: N_S): AnyNode {
  return (typeof value !== "object") ? constant(value) : value
}

type _NodeList = { [key: string]: NodeList } & { operation?: never }
type NodeList = _NodeList | ReadNode<number> | ReadNode<string>

/**
 * `v1` === `v2` ? `match` : `unmatch`
 * @deprecated Use `equal`, `unequal`, `equalStr`, or `compareEq` instead
 */
export function matchFull(v1: Num, v2: Num, match: Num, unmatch: Num, info?: Info): MatchNode<NumNode>
export function matchFull(v1: Num, v2: Num, match: Str, unmatch: Str, info?: Info): MatchNode<StrNode>
export function matchFull(v1: Str, v2: Str, match: Num, unmatch: Num, info?: Info): MatchNode<NumNode>
export function matchFull(v1: Str, v2: Str, match: Str, unmatch: Str, info?: Info): MatchNode<StrNode>
export function matchFull(v1: N_S, v2: N_S, match: N_S, unmatch: N_S, info?: Info): MatchNode<AnyNode> {
  return { operation: "match", operands: [intoV(v1), intoV(v2), intoV(match), intoV(unmatch)], info }
}
