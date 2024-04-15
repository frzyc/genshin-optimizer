import type {
  ArtifactSetKey,
  CharacterSheetKey,
  ElementWithPhyKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type {
  AdditiveReactionsKey,
  AmplifyingReactionsKey,
  TransformativeReactionsKey,
} from '@genshin-optimizer/gi/keymap'
import type { input, uiInput } from './formula'

export type NumNode =
  | ComputeNode
  | ThresholdNode<NumNode>
  | DataNode<NumNode>
  | LookupNode<NumNode>
  | MatchNode<NumNode>
  | SubscriptNode<number>
  | ReadNode<number>
  | ConstantNode<number>
export type StrNode =
  | StrPrioNode
  | SmallestNode
  | ThresholdNode<StrNode>
  | DataNode<StrNode>
  | LookupNode<StrNode>
  | MatchNode<StrNode>
  | ReadNode<string | undefined>
  | ConstantNode<string | undefined>
type AnyNode = NumNode | StrNode

export type KeyMapPrefix =
  | 'default'
  | 'base'
  | 'total'
  | 'uncapped'
  | 'custom'
  | 'char'
  | 'art'
  | 'weapon'
  | 'teamBuff'

export type Info = {
  path?: string
  unit?: Unit
  prefix?: KeyMapPrefix
  source?: CharacterSheetKey | WeaponKey | ArtifactSetKey
  variant?: InfoVariant
  subVariant?: InfoVariant
  asConst?: true
  pivot?: true
  fixed?: number
  isTeamBuff?: boolean
  multi?: number
}
export type Variant =
  | ElementWithPhyKey
  | TransformativeReactionsKey
  | AmplifyingReactionsKey
  | AdditiveReactionsKey
  | 'heal'
export type InfoVariant = Variant | 'invalid'

interface Base<Leaf extends Base<Leaf>> {
  info?: Info
  operands: readonly Leaf[]
}
export interface StrPrioNode<Leaf = AnyNode> extends Base<Leaf> {
  operation: 'prio'
  operands: readonly StrNode[]
}
/** Pick the lexcicographically smallest non-`undefined` value. If all values are `undefined` or there is no value, use `undefined`. */
export interface SmallestNode<Leaf = AnyNode> extends Base<Leaf> {
  operation: 'small'
  operands: readonly StrNode[]
}
export interface LookupNode<
  Output,
  Input extends StrNode = StrNode,
  Leaf extends Input | Output = AnyNode
> extends Base<Leaf> {
  operation: 'lookup'
  operands:
    | readonly [index: Input]
    | readonly [index: Input, defaultNode: Output]
  table: Record<string, Output>
}
export interface DataNode<Output, Leaf extends Output = AnyNode>
  extends Base<Leaf> {
  operation: 'data'
  operands: readonly [Output]
  data: Data
  reset?: true
}
export interface ComputeNode<
  Input extends NumNode = NumNode,
  Leaf extends Input = AnyNode
> extends Base<Leaf> {
  operation: Operation
  operands: readonly Input[]
}
export interface ThresholdNode<
  Output,
  Input extends NumNode = NumNode,
  Leaf extends Input | Output = AnyNode
> extends Base<Leaf> {
  operation: 'threshold'
  operands: readonly [Input, Input, Output, Output]
  emptyOn?: 'ge' | 'l'
}
export interface MatchNode<
  Output,
  Input = AnyNode,
  Leaf extends Input | Output = AnyNode
> extends Base<Leaf> {
  operation: 'match'
  operands: readonly [v1: Input, v2: Input, match: Output, unmatch: Output]
  emptyOn?: 'match' | 'unmatch'
}
export interface SubscriptNode<
  Value,
  Input extends NumNode = NumNode,
  Leaf extends Input = AnyNode
> extends Base<Leaf> {
  operation: 'subscript'
  operands: readonly [index: Input]
  list: readonly Value[]
}
export interface ReadNode<Value> extends Base<any> {
  operation: 'read'
  operands: readonly []
  accu?: Value extends number ? CommutativeMonoidOperation : 'small'
  path: readonly string[]
  type: Value extends number
    ? 'number'
    : Value extends string
    ? 'string'
    : undefined
}
export interface ConstantNode<Value> extends Base<any> {
  operation: 'const'
  operands: readonly []
  value: Value
  type: Value extends number
    ? 'number'
    : Value extends string
    ? 'string'
    : undefined
}

type _StrictInput<T, Num, Str> = T extends ReadNode<number>
  ? Num
  : T extends ReadNode<string>
  ? Str
  : { [key in keyof T]: _StrictInput<T[key], Num, Str> }
type _Input<T, Num, Str> = T extends ReadNode<number>
  ? Num
  : T extends ReadNode<string>
  ? Str
  : { [key in keyof T]?: _Input<T[key], Num, Str> }
export type StrictInput<Num = NumNode, Str = StrNode> = _StrictInput<
  typeof input,
  Num,
  Str
>
export type Input<Num = NumNode, Str = StrNode> = _Input<typeof input, Num, Str>
export type UIInput<Num = NumNode, Str = StrNode> = _Input<
  typeof uiInput,
  Num,
  Str
>

export type Data = Input & DynamicNumInput
export type DisplaySub<T = NumNode> = Record<string, T>
interface DynamicNumInput<T = NumNode> {
  display?: {
    [key: string]: DisplaySub
  }
  conditional?: NodeData<T>
  teamBuff?: Input & { tally?: NodeData }
}
export interface NodeData<T = NumNode> {
  [key: string]: typeof key extends 'operation' ? never : NodeData<T> | T
}

export type CommutativeMonoidOperation = 'min' | 'max' | 'add' | 'mul'
export type Operation =
  | CommutativeMonoidOperation
  | 'res' // Resistance from base resistance
  | 'sum_frac' // linear fractional; operands[0] / (operands[0] + operands[1])
