import type {
  AdditiveReactionKey,
  AmpReactionKey,
  InfusionAuraElementKey,
  MultiOptHitModeKey,
} from '@genshin-optimizer/gi/consts'
export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  // TODO: Partial<Record<InputPremodKey, number>>
  bonusStats: Record<string, number>
}

export const UnaryOperations = [
  'priority',
  // 'ceil',
] as const
export type UnaryOperation = (typeof UnaryOperations)[number]

export const BinaryOperations = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
] as const
export type BinaryOperation = (typeof BinaryOperations)[number]

export const VariadicOperations = ['minimum', 'maximum', 'average'] as const
export type VariadicOperation = (typeof VariadicOperations)[number]

export const ExpressionOperations = [
  ...UnaryOperations,
  ...BinaryOperations,
  ...VariadicOperations,
] as const
export type ExpressionOperation = (typeof ExpressionOperations)[number]

export const EnclosingOperations = [
  'minimum',
  'maximum',
  'average',
  'priority',
  // 'ceil',
] as const
export type EnclosingOperation = (typeof EnclosingOperations)[number]

export const isEnclosingOperation = (op: unknown): op is EnclosingOperation =>
  EnclosingOperations.includes(op as EnclosingOperation)

export const NonEnclosingOperations = [
  ...ExpressionOperations.filter(
    (op: unknown): op is NonEnclosingOperation => !isEnclosingOperation(op)
  ),
] as const
export type NonEnclosingOperation = Exclude<
  ExpressionOperation,
  EnclosingOperation
>

export const ExpressionUnitTypes = [
  'constant',
  'target',
  'operation',
  'enclosing',
  'null',
] as const
export type ExpressionUnitType = (typeof ExpressionUnitTypes)[number]

export type ExpressionUnit =
  | ConstantUnit
  | TargetUnit
  | OperationUnit
  | EnclosingUnit
  | NullUnit

export interface ConstantUnit {
  type: 'constant'
  value: number
}

export interface TargetUnit {
  type: 'target'
  target: CustomTarget
}

export interface OperationUnit {
  type: 'operation'
  operation: NonEnclosingOperation
}

export type EnclosingUnit =
  | EnclosingUnitHead
  | EnclosingUnitComma
  | EnclosingUnitTail

export interface EnclosingUnitHead {
  type: 'enclosing'
  operation: EnclosingOperation
  part: 'head'
}

export interface EnclosingUnitComma {
  type: 'enclosing'
  part: 'comma'
}

export interface EnclosingUnitTail {
  type: 'enclosing'
  part: 'tail'
}

export interface NullUnit {
  type: 'null'
  kind: 'operand' | 'operation'
}

export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
  expression?: ExpressionUnit[]
}
