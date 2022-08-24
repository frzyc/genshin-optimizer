import type { KeyMapPrefix } from "../KeyMap"
import type { AdditiveReactionsKey, AmplifyingReactionsKey, TransformativeReactionsKey } from "../KeyMap/StatConstants"
import type { ArtifactSetKey, CharacterKey, ElementKeyWithPhy, WeaponKey } from "../Types/consts"
import type { input, uiInput } from "./index"

export type NumNode = ComputeNode | ThresholdNode<NumNode> |
  DataNode<NumNode> |
  LookupNode<NumNode> | MatchNode<StrNode, NumNode> | MatchNode<NumNode, NumNode> |
  SubscriptNode<number> |
  ReadNode<number> | ConstantNode<number>
export type StrNode = StrPrioNode | SmallestNode |
  DataNode<StrNode> |
  LookupNode<StrNode> |
  MatchNode<StrNode, StrNode> | MatchNode<NumNode, StrNode> |
  ReadNode<string | undefined> | ConstantNode<string | undefined>
export type AnyNode = NumNode | StrNode | {
  operation: string
  operands: readonly AnyNode[]
  info?: Info
}

interface Info {
  key?: string
  prefix?: KeyMapPrefix
  source?: CharacterKey | WeaponKey | ArtifactSetKey
  variant?: Variant
  subVariant?: Variant
  asConst?: true
  pivot?: true
  fixed?: number
  isTeamBuff?: boolean
}
export type Variant = ElementKeyWithPhy | TransformativeReactionsKey | AmplifyingReactionsKey | AdditiveReactionsKey | "heal" | "invalid"

interface Base {
  operands: readonly AnyNode[]
  info?: Info
}
export interface StrPrioNode extends Base {
  operation: "prio"
  operands: readonly StrNode[]
}
/** Pick the lexcicographically smallest non-`undefined` value. If all values are `undefined` or there is no value, use `undefined`. */
export interface SmallestNode extends Base {
  operation: "small"
  operands: readonly StrNode[]
}
export interface LookupNode<Output> extends Base {
  operation: "lookup"
  operands: readonly [index: StrNode] | readonly [index: StrNode, defaultNode: Output]
  table: Dict<string, Output>
}
export interface DataNode<Output> extends Base {
  operation: "data"
  operands: readonly [Output]
  data: Data
  reset?: true
}
export interface ComputeNode extends Base {
  operation: Operation
  operands: readonly NumNode[]
}
export interface ThresholdNode<Output> extends Base {
  operation: "threshold"
  operands: readonly [NumNode, NumNode, Output, Output]
  emptyOn?: "ge" | "l"
}
export interface MatchNode<Input, Output> extends Base {
  operation: "match"
  operands: readonly [v1: Input, v2: Input, match: Output, unmatch: Output]
  emptyOn?: "match" | "unmatch"
}
export interface SubscriptNode<Value> extends Base {
  operation: "subscript"
  operands: readonly [index: NumNode]
  list: readonly Value[]
}
export interface ReadNode<Value> extends Base {
  operation: "read"
  operands: readonly []
  accu?: Value extends number ? CommutativeMonoidOperation : "small"
  path: readonly string[]
  type: Value extends number ? "number" : Value extends string ? "string" : undefined
}
export interface ConstantNode<Value> extends Base {
  operation: "const"
  operands: readonly []
  value: Value
  type: Value extends number ? "number" : Value extends string ? "string" : undefined
}

type _StrictInput<T, Num, Str> = T extends ReadNode<number> ? Num : T extends ReadNode<string> ? Str : { [key in keyof T]: _StrictInput<T[key], Num, Str> }
type _Input<T, Num, Str> = T extends ReadNode<number> ? Num : T extends ReadNode<string> ? Str : { [key in keyof T]?: _Input<T[key], Num, Str> }
export type StrictInput<Num = NumNode, Str = StrNode> = _StrictInput<typeof input, Num, Str>
export type Input<Num = NumNode, Str = StrNode> = _Input<typeof input, Num, Str>
export type UIInput<Num = NumNode, Str = StrNode> = _Input<typeof uiInput, Num, Str>

export type Data = Input & DynamicNumInput
export type DisplaySub<T = NumNode> = { [key in string]?: T }
interface DynamicNumInput<T = NumNode> {
  display?: {
    [key: string]: DisplaySub
  }
  conditional?: NodeData<T>
  teamBuff?: Input & { tally?: NodeData }
}
export interface NodeData<T = NumNode> {
  [key: string]: typeof key extends "operation" ? never : (NodeData<T> | T)
}

export type CommutativeMonoidOperation = "min" | "max" | "add" | "mul"
export type Operation = CommutativeMonoidOperation |
  "res" |    // Resistance from base resistance
  "sum_frac" // linear fractional; operands[0] / (operands[0] + operands[1])
