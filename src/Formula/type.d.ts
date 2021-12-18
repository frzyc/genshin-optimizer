import { ElementKey, ReactionModeKey } from "../Types/consts"
import type { Path } from "../Util/KeyPathUtil"

export type Node =
  ConstantNode | StringNode |
  ComputeNode |
  SubscriptNode | StringSubscriptNode |
  ReadNode | DataNode

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
export interface StringNode extends NodeBase {
  operation: "string"
  value: string
}

export interface SubscriptNode extends NodeBase {
  operation: "subscript"
  list: number[]
}
export interface StringSubscriptNode extends NodeBase {
  operation: "stringSubscript"
  list: Dict<string, Node>
}

export interface ReadNode extends NodeBase {
  operation: "read"
  key: Path<FormulaData, Node | undefined>
  accumulation: CommutativeMonoidOperation | "unique"
}
export interface DataNode extends NodeBase {
  operation: "data"
  data: Data[]
}
export interface Data {
  formula: FormulaData
}
export interface FormulaData {
  [key: string]: typeof key extends "operation" ? undefined : FormulaData | Node
}

export interface ComputeNode extends NodeBase {
  operation: Operation
}

export type CommutativeMonoidOperation = "min" | "max" | "add" | "mul"
export type Operation = CommutativeMonoidOperation |
  "res" |         // Resistance from base resistance
  "sum_frac" |    // linear fractional; operands[0] / (operands[0] + operands[1])
  "threshold_add" // operands[0] <= operands[1] ? operands[2] : 0
