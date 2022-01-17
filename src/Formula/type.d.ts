import type { MainStatKey, SubstatKey } from "../Types/artifact"
import type { ArtifactSetKey, ElementKey, ElementKeyWithPhy, ReactionModeKey } from "../Types/consts"
import type { Path } from "../Util/KeyPathUtil"
import type { Input } from "./index"

type Move = "normal" | "charged" | "plunging" | "skill" | "burst"
type Stat = MainStatKey | SubstatKey

export type Node =
  ConstantNode | ComputeNode |
  SubscriptNode |
  ReadNode | DataNode

export type StringNode =
  StringConstantNode | StringPriorityNode |
  StringReadNode

interface NodeBase {
  operands: Node[]
  info?: Info
}
interface Info {
  key?: string
  namePrefix?: string
  variant?: ElementKeyWithPhy | "success"
  unit?: "%" | "flat"
}

export interface ConstantNode extends NodeBase {
  operation: "const"
  value: number
}
export interface ComputeNode extends NodeBase {
  operation: Operation
}
export interface SubscriptNode extends NodeBase {
  operation: "subscript"
  list: number[]
}

export interface ReadNode extends NodeBase {
  operation: "read"
  key: Path<NodeData, Node | undefined>
  suffix?: StringNode
  asConst?: boolean
  accumulation: CommutativeMonoidOperation | "unique"
}
export interface DataNode extends NodeBase {
  operation: "data"
  data: Data[]
}

interface StringNodeBase {
  operands: StringNode[]
}
export interface StringConstantNode extends StringNodeBase {
  operation: "sconst"
  value: string
}
export interface StringPriorityNode extends StringNodeBase {
  operation: "prio"
}
export interface StringReadNode extends StringNodeBase {
  operation: "sread"
  key: Path<StringFormulaTemplate, StringNode>
  suffix?: StringNode

  accumulation?: never
}

export type Data = Input & DynamicNumInput
interface DynamicNumInput<T = Node> {
  display?: { [key in Move | "misc"]?: { [key in string]?: T } }
  conditional?: NodeData<T>
  misc?: any
}
export interface NodeData<T = Node> {
  [key: string]: typeof key extends "operation" ? never : (NodeData<T> | T)
}

export type CommutativeMonoidOperation = "min" | "max" | "add" | "mul"
export type Operation = CommutativeMonoidOperation |
  "res" |         // Resistance from base resistance
  "sum_frac" |    // linear fractional; operands[0] / (operands[0] + operands[1])
  "threshold_add" // operands[0] <= operands[1] ? operands[2] : 0
