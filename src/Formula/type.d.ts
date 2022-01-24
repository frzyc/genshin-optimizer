import { AmplifyingReactionsKey, TransformativeReactionsKey } from "../StatConstants"
import type { MainStatKey, SubstatKey } from "../Types/artifact"
import type { ArtifactSetKey, CharacterKey, ElementKey, ElementKeyWithPhy, ReactionModeKey, WeaponKey } from "../Types/consts"
import type { Path } from "../Util/KeyPathUtil"
import type { Input } from "./index"

type Move = "normal" | "charged" | "plunging" | "skill" | "burst"
type Stat = MainStatKey | SubstatKey

export type Node =
  ConstantNode | ComputeNode | StringMatchNode |
  SubscriptNode | LookupNode |
  ReadNode | DataNode | DataResetNode

export type StringNode =
  StringConstantNode | StringPriorityNode |
  StringReadNode | StringMatchStringNode | StringLookupNode

interface NodeBase {
  operands: Node[]
  info?: Info
}
interface Info {
  key?: string
  namePrefix?: string
  variant?: Variant
  asConst?: true
  pivot?: true
}
export type Variant = ElementKeyWithPhy | TransformativeReactionsKey | AmplifyingReactionsKey | "success"

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
export interface StringMatchNode extends NodeBase {
  operation: "match" | "unmatch"
  string1: StringNode
  string2: StringNode
}
export interface LookupNode extends NodeBase {
  operation: "lookup"
  string: StringNode
  table: Dict<string | undefined, Node>
}

export interface ReadNode extends NodeBase {
  operation: "read"
  path: Path<NodeData, Node | undefined>
  accumulation: CommutativeMonoidOperation | "unique"
}
export interface DataNode extends NodeBase {
  operation: "data"
  data: Data
}
export interface DataResetNode extends NodeBase {
  operation: "reset"
}

interface StringNodeBase {
  operands: StringNode[]
}
export interface StringConstantNode extends StringNodeBase {
  operation: "sconst"
  value: string | undefined
}
export interface StringPriorityNode extends StringNodeBase {
  operation: "prio"
}
export interface StringMatchStringNode extends StringNodeBase {
  operation: "smatch"
}
export interface StringReadNode extends StringNodeBase {
  operation: "sread"
  path: Path<StringFormulaTemplate, StringNode>

  accumulation?: never
}
export interface StringLookupNode extends StringNodeBase {
  operation: "slookup"
  table: Dict<string | undefined, StringNode>
}

export type Data = Input & DynamicNumInput
export type DisplayCharacter<T = Node> = { [key in Move | "misc"]?: { [key in string]?: T } }
export type DisplayWeapon<T = Node> = { [key in string]?: T }
export type DisplayArtifact<T = Node> = { [key in string]?: T }
interface DynamicNumInput<T = Node> {
  display?: {
    character?: {
      [key in CharacterKey]?: DisplayCharacter<T>
    }
    weapon?: {
      [key in WeaponKey]?: DisplayWeapon<T>
    }
    artifact?: {
      [key in ArtifactSetKey]?: DisplayArtifact<T>
    }
    reaction?: {
      [key in Exclude<TransformativeReactionsKey, "swirl"> | `${"electro" | "hydro" | "pyro" | "cryo"}Swirl`]?: Node
    }
  }
  conditional?: NodeData<T>
}
export interface NodeData<T = Node> {
  [key: string]: typeof key extends "operation" ? never : (NodeData<T> | T)
}

export type CommutativeMonoidOperation = "min" | "max" | "add" | "mul"
export type Operation = CommutativeMonoidOperation |
  "res" |         // Resistance from base resistance
  "sum_frac" |    // linear fractional; operands[0] / (operands[0] + operands[1])
  "threshold_add" // operands[0] <= operands[1] ? operands[2] : 0
