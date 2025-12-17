import type {
  AdditiveReactionKey,
  AmpReactionKey,
  CharacterKey,
  InfusionAuraElementKey,
  MultiOptHitModeKey,
} from '@genshin-optimizer/gi/consts'
import type { InputPremodKey } from '@genshin-optimizer/gi/wr-types'

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

const ExpressionOperations = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'priority',
  'minimum',
  'maximum',
  'average',
  'clamp',
  'sum_fraction',
  // 'ceil',
  // 'floor',
] as const
export type ExpressionOperation = (typeof ExpressionOperations)[number]
export const isExpressionOperation = (op: unknown): op is ExpressionOperation =>
  ExpressionOperations.includes(op as ExpressionOperation)

const EnclosingOperations = [
  'priority',
  'minimum',
  'maximum',
  'average',
  'clamp',
  'sum_fraction',
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

interface NonEnclosingOperationSpec {
  symbol: string
  precedence: number
  description: string | null
}

interface EnclosingOperationSpec {
  symbol: string
  precedence: number
  arity: { min: number; max: number }
  enclosing: { left: string; right: string }
  description: string | null
}

/** Typical Enclosing Specifications */
const tes = (
  symbol: string,
  {
    precedence = 3,
    arity = { min: 1, max: Infinity },
    enclosing = { left: '(', right: ')' },
    description = null,
  }: Partial<EnclosingOperationSpec> = {}
) => ({
  symbol,
  precedence,
  arity,
  enclosing,
  description,
})

/** Typical Non-Enclosing Specifications */
const tnes = (
  symbol: string,
  {
    precedence = 3,
    description = null,
  }: Partial<NonEnclosingOperationSpec> = {}
) => ({
  symbol,
  precedence,
  description,
})

export const OperationSpecs: Record<
  NonEnclosingOperation,
  NonEnclosingOperationSpec
> &
  Record<EnclosingOperation, EnclosingOperationSpec> = {
  addition: tnes('+', { precedence: 1 }),
  subtraction: tnes('-', { precedence: 1 }),
  multiplication: tnes('*', { precedence: 2 }),
  division: tnes('/', { precedence: 2 }),
  priority: tes('', { arity: { min: 1, max: 1 } }),
  minimum: tes('min'),
  maximum: tes('max'),
  average: tes('avg', {
    description: 'avg(x1, x2, ..., xn) = (x1 + x2 + ... + xn) / n',
  }),
  clamp: tes('clamp', {
    arity: { min: 3, max: 3 },
    description: 'clamp(min, max, value) = min(max, max(min, value))',
  }),
  sum_fraction: tes('sum_fraction', {
    arity: { min: 2, max: 2 },
    description: 'sum_fraction(x1, x2) = x1 / (x1 + x2)',
  }),
} as const

const ExpressionUnitTypes = [
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

export interface TeamTarget {
  char: CharacterKey
  target: CustomMultiTarget
}

export type ExpressionUnit<
  Target extends CustomTarget | TeamTarget = CustomTarget,
> =
  | ConstantUnit
  | TargetUnit<Target>
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

export interface TargetUnit<
  Target extends CustomTarget | TeamTarget = CustomTarget,
> extends BaseUnit {
  type: 'target'
  target: Target
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

export interface UnitAddress {
  type: 'unit'
  layer: number
  index: number
}

export interface FunctionAddress {
  type: 'function'
  layer: number
  index?: never
}

export interface ArgumentAddress {
  type: 'argument'
  layer: number
  index: number
}

export type ItemAddress =
  | UnitAddress
  | FunctionAddress
  | ArgumentAddress
  | undefined

/**
 * `related`, `dependent`, `independent` and `all` should not contain `this`
 */
export interface ItemRelations {
  this: ItemAddress
  related: NonNullable<ItemAddress>[]
  dependent: NonNullable<ItemAddress>[]
  independent: NonNullable<ItemAddress>[]
  all: NonNullable<ItemAddress>[]
}

export type AddressItemTypesMap =
  | [FunctionAddress, CustomFunction]
  | [ArgumentAddress, CustomFunctionArgument]
  | [UnitAddress, ExpressionUnit]

export type ExpressionItem =
  | CustomFunction
  | CustomFunctionArgument
  | ExpressionUnit

export interface CustomFunctionArgument {
  name: string
  description?: string
}

export interface CustomFunction {
  name: string
  args: CustomFunctionArgument[]
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
