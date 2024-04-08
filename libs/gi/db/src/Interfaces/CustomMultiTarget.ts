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

export const ExpressionOperations = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'minimum',
  'maximum',
  'average',
  'grouping',
] as const
export type ExpressionOperation = (typeof ExpressionOperations)[number]
export type ExpressionOperand = ExpressionNode | CustomTarget | number

export interface ExpressionNode {
  operation: ExpressionOperation
  operands: ExpressionOperand[]
}

export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
  expression?: ExpressionNode
}
