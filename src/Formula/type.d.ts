import { ElementKey, ReactionModeKey } from "../Types/consts"
import type { Path } from "../Util/KeyPathUtil"

export type Node =
  ConstantNode | ComputeNode |
  SubscriptNode | InputNode |
  ReadNode | DataNode

export type StringNode =
  StringConstantNode | StringPriorityNode |
  StringReadNode

interface NodeBase {
  operands: Node[]
  info?: Info
}
interface Info {
  name?: string
  variant?: "physical" | ElementKey | ReactionModeKey
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
export interface InputNode extends NodeBase {
  operation: "input"
  key: string
}

export interface ReadNode extends NodeBase {
  operation: "read"
  key: Path<NodeData, Node | undefined>
  suffix?: StringNode
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
  operation: "const"
  value: string
}
export interface StringPriorityNode extends StringNodeBase {
  operation: "prio"
}
export interface StringReadNode extends StringNodeBase {
  operation: "read"
  key: Path<StringNodeData, string | undefined>
  suffix?: StringNode
}

export interface Data {
  number: NodeData
  string: StringNodeData
}
export interface NodeData {
  [key: string]: typeof key extends "operation" ? undefined : NodeData | Node
}
export interface StringNodeData {
  [key: string]: typeof key extends "operation" ? undefined : StringNodeData | StringNode
}

export type CommutativeMonoidOperation = "min" | "max" | "add" | "mul"
export type Operation = CommutativeMonoidOperation |
  "res" |         // Resistance from base resistance
  "sum_frac" |    // linear fractional; operands[0] / (operands[0] + operands[1])
  "threshold_add" // operands[0] <= operands[1] ? operands[2] : 0
