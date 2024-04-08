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

export const validExpressionOperators = [
  '+',
  'sum',
  'summation',
  'add',
  'addition',
  'plus',
  '-',
  'sub',
  'subtract',
  'subtraction',
  'minus',
  '*',
  'mul',
  'multiply',
  'multiplication',
  'times',
  'x',
  '/',
  'div',
  'divide',
  'division',
  'avg',
  'average',
  'mean',
  'min',
  'minimum',
  'max',
  'maximum',
  'group',
  '()', // group is a special operator that does not do anything, but is used to group operands
] as const
export type ExpressionOperand = ExpressionNode | CustomTarget | number

export interface ExpressionNode {
  operation: (typeof validExpressionOperators)[number]
  operands: ExpressionOperand[]
}

export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
  expression?: ExpressionNode
}
