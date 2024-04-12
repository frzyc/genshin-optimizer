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

export const BinaryOperations = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
] as const
export type BinaryOperation = (typeof BinaryOperations)[number]

export const EnclosingOperations = [
  'minimum',
  'maximum',
  'average',
  'grouping',
] as const
export type EnclosingOperation = (typeof EnclosingOperations)[number]

export const NonenclosingOperations = [...BinaryOperations] as const
export type NonenclosingOperation = (typeof NonenclosingOperations)[number]

export const ExpressionOperations = [
  ...NonenclosingOperations,
  ...EnclosingOperations,
] as const
export type ExpressionOperation = (typeof ExpressionOperations)[number]

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
  operation: NonenclosingOperation
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
