import { MainStatKey, SubstatKey } from "../Types/artifact"
import { ArtifactSetKey, ElementKey, ElementKeyWithPhy, ReactionModeKey } from "../Types/consts"
import type { Path } from "../Util/KeyPathUtil"

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

  accumulation?: never
}

export interface Data {
  number: NumFormulaTemplate
  string: StringFormulaTemplate
}
type Stat = MainStatKey | SubstatKey
type DMGBonus = "normal" | "charge" | "plunge" | "skill" | "burst"
interface NumFormulaTemplate<T extends Node = Node> {
  base?: { atk?: T, hp?: T, def?: T, }
  premod?: { [key in Stat | DMGBonus]?: T }
  postmod?: { [key in Stat | DMGBonus]?: T }
  total?: { [key in Stat | "cappedCritRate" | DMGBonus]?: T }

  art?: { [key in Stat | "" /** TODO: Replace this with ArtifactSetKey once we add them back */]?: T }
  char?: { [key in "level" | "constellation" | "ascension" | "auto" | "skill" | "burst"]?: T }
  weapon?: { [key in "level" | "ascension" | "refinement"]?: T }
  enemy?: {
    res?: { [key in "byElement" | ElementKeyWithPhy]?: T }
    level?: T, def?: T, defRed?: T
  }

  display?: {
    [key in "normal" | "charged" | "plunging" | "skill" | "burst"]?: { [key in string]?: T }
  }

  hit?: {
    dmg?: T, base?: T, dmgBonus?: T
    amp?: { reactionMulti?: T, multi?: T, base?: T, }
    critValue?: { [key in "byType" | "base" | "crit" | "avg"]?: T }
  }
  conditional?: NodeData
}
interface StringFormulaTemplate<T extends StringNode = StringNode> {
  char?: { key?: T, element?: T }
  weapon?: { key?: T, type?: T }
  dmg?: { element?: T, reaction?: T, move?: T, critType?: T }
}
interface NodeData {
  [key: string]: typeof key extends "operation" ? undefined : NodeData | Node
}
interface StringNodeData {
  [key: string]: typeof key extends "operation" ? undefined : StringNodeData | StringNode
}

export type CommutativeMonoidOperation = "min" | "max" | "add" | "mul"
export type Operation = CommutativeMonoidOperation |
  "res" |         // Resistance from base resistance
  "sum_frac" |    // linear fractional; operands[0] / (operands[0] + operands[1])
  "threshold_add" // operands[0] <= operands[1] ? operands[2] : 0
