import type {
  AdditiveReactionKey,
  AmpReactionKey,
  InfusionAuraElementKey,
  MultiOptHitModeKey,
} from '@genshin-optimizer/gi/consts'
import type { InputPremodKey } from '../legacy/keys'

export type BonusStats = Partial<Record<InputPremodKey, number>>
export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  bonusStats: BonusStats
  description: string
}

export const ExpressionOperations = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'priority',
  'minimum',
  'maximum',
  'average',
  // 'ceil',
  // 'floor',
  // 'clamp',
] as const
export type ExpressionOperation = (typeof ExpressionOperations)[number]
export const isExpressionOperation = (op: unknown): op is ExpressionOperation =>
  ExpressionOperations.includes(op as ExpressionOperation)

export const EnclosingOperations = [
  'priority',
  'minimum',
  'maximum',
  'average',
] as const
export type EnclosingOperation = (typeof EnclosingOperations)[number]
export const isEnclosing = (op: unknown): op is EnclosingOperation =>
  EnclosingOperations.includes(op as EnclosingOperation)

export type NonEnclosingOperation = Exclude<
  ExpressionOperation,
  EnclosingOperation
>
export const isNonEnclosing = (op: unknown): op is NonEnclosingOperation =>
  isExpressionOperation(op) && !isEnclosing(op)
export const NonEnclosingOperations =
  ExpressionOperations.filter(isNonEnclosing)

export const OperationSpecs: Record<
  NonEnclosingOperation,
  {
    symbol: string
    precedence: number
  }
> &
  Record<
    EnclosingOperation,
    {
      symbol: string
      precedence: number
      arity: { min: number; max: number }
      enclosing: { left: string; right: string }
    }
  > = {
  addition: { symbol: '+', precedence: 1 },
  subtraction: { symbol: '-', precedence: 1 },
  multiplication: { symbol: '*', precedence: 2 },
  division: { symbol: '/', precedence: 2 },
  priority: {
    symbol: '',
    precedence: 3,
    arity: { min: 1, max: 1 },
    enclosing: { left: '(', right: ')' },
  },
  minimum: {
    symbol: 'min',
    precedence: 3,
    arity: { min: 1, max: Infinity },
    enclosing: { left: '(', right: ')' },
  },
  maximum: {
    symbol: 'max',
    precedence: 3,
    arity: { min: 1, max: Infinity },
    enclosing: { left: '(', right: ')' },
  },
  average: {
    symbol: 'avg',
    precedence: 3,
    arity: { min: 1, max: Infinity },
    enclosing: { left: '(', right: ')' },
  },
} as const

export const ExpressionUnitTypes = [
  'constant',
  'target',
  'operation',
  'function',
  'enclosing',
  'null',
] as const
export type ExpressionUnitType = (typeof ExpressionUnitTypes)[number]
export const isExpressionUnitType = (
  type: unknown
): type is ExpressionUnitType => {
  return ExpressionUnitTypes.includes(type as ExpressionUnitType)
}

export type ExpressionUnit =
  | ConstantUnit
  | TargetUnit
  | OperationUnit
  | FunctionUnit
  | EnclosingUnit
  | NullUnit

interface BaseUnit {
  type: ExpressionUnitType
  description?: string
}

export interface ConstantUnit extends BaseUnit {
  type: 'constant'
  value: number
}

export interface TargetUnit extends BaseUnit {
  type: 'target'
  target: CustomTarget
}

export interface OperationUnit extends BaseUnit {
  type: 'operation'
  operation: NonEnclosingOperation
}

export interface FunctionUnit extends BaseUnit {
  type: 'function'
  name: string
}

export type EnclosingUnit = EnclosingHeadUnit | EnclosingPartUnit

export interface EnclosingHeadUnit extends BaseUnit {
  type: 'enclosing'
  part: 'head'
  operation: EnclosingOperation
}

export interface EnclosingPartUnit extends BaseUnit {
  type: 'enclosing'
  part: 'comma' | 'tail'
}

export interface NullUnit extends BaseUnit {
  type: 'null'
  kind: 'operand' | 'operation'
}

export interface CustomFunction {
  name: string
  args: string[]
  expression: ExpressionUnit[]
  description?: string
}

export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
  functions?: CustomFunction[]
  expression?: ExpressionUnit[]
}
