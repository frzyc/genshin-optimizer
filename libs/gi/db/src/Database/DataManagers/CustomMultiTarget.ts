import type { MultiOptHitModeKey } from '@genshin-optimizer/gi/consts'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allInfusionAuraElementKeys,
  allMultiOptHitModeKeys,
} from '@genshin-optimizer/gi/consts'

import {
  EnclosingOperations,
  ExpressionUnitTypes,
  NonenclosingOperations,
  type CustomMultiTarget,
  type CustomTarget,
  type EnclosingOperation,
  type ExpressionUnit,
} from '../../Interfaces/CustomMultiTarget'
import type { InputPremodKey } from '../../legacy/keys'
import { allInputPremodKeys } from '../../legacy/keys'

export const MAX_NAME_LENGTH = 200
export const MAX_DESC_LENGTH = 2000
export function initCustomMultiTarget() {
  return {
    name: 'New Custom Target',
    targets: [],
  }
}
export function initCustomTarget(path: string[], multi = 1): CustomTarget {
  return {
    weight: multi,
    path,
    hitMode: 'avgHit',
    bonusStats: {},
  }
}

export function initExpressionUnit(
  args: Partial<ExpressionUnit> = {}
): ExpressionUnit {
  switch (args.type) {
    case 'constant':
      return { ...args, type: 'constant', value: args.value ?? 1 }
    case 'target':
      return {
        ...args,
        type: 'target',
        target: args.target ?? initCustomTarget([]),
      }
    case 'operation':
      return {
        ...args,
        type: 'operation',
        operation: args.operation ?? 'addition',
      }
    case 'enclosing':
      switch (args.part) {
        case 'head':
          return {
            ...args,
            type: 'enclosing',
            part: 'head',
            operation: args.operation ?? 'grouping',
          }
        case 'comma':
          return { ...args, type: 'enclosing', part: 'comma' }
        case 'tail':
          return { ...args, type: 'enclosing', part: 'tail' }
        default:
          return {
            ...args,
            type: 'enclosing',
            part: 'head',
            operation: 'grouping',
          }
      }
    case 'null':
      return { ...args, type: 'null', kind: args.kind ?? 'operation' }
    default:
      return { type: 'null', kind: 'operation' }
  }
}

function validateOptTarget(path: string[]): string[] {
  // TODO: validate path. This function will probably need to be async
  return path
}
function validateCustomTarget(ct: unknown): CustomTarget | undefined {
  if (typeof ct !== 'object') return undefined
  let { weight, path, hitMode, reaction, infusionAura, bonusStats } =
    ct as CustomTarget

  if (typeof weight !== 'number' || weight <= 0) weight = 1

  if (!Array.isArray(path) || path[0] === 'custom') return undefined

  path = validateOptTarget(path)

  if (
    !hitMode ||
    typeof hitMode !== 'string' ||
    !allMultiOptHitModeKeys.includes(hitMode as MultiOptHitModeKey)
  )
    hitMode = 'avgHit'

  if (
    reaction &&
    !(allAmpReactionKeys as readonly string[]).includes(reaction) &&
    !(allAdditiveReactions as readonly string[]).includes(reaction)
  )
    reaction = undefined

  if (infusionAura && !allInfusionAuraElementKeys.includes(infusionAura))
    infusionAura = undefined

  if (!bonusStats) bonusStats = {}

  bonusStats = Object.fromEntries(
    Object.entries(bonusStats).filter(
      ([key, value]) =>
        allInputPremodKeys.includes(key as InputPremodKey) &&
        typeof value == 'number'
    )
  )

  return { weight, path, hitMode, reaction, infusionAura, bonusStats }
}

export function validateCustomExpression(
  ce: unknown
): ExpressionUnit[] | undefined {
  if (!Array.isArray(ce)) return undefined
  // Need to ignore any null and enclosing(comma) units
  // Need to ignore any enclosing(tail) unit if stack is empty
  // Need to add null(operand) unit between any two non-operand units, and nothing is also considered a non-operand unit
  // Need to add null(operation) or current enclosing(comma) unit between any two operand units
  // Need to add enclosing(tail) units if stack is not empty
  const stack: EnclosingOperation[] = []
  let lastUnit = initExpressionUnit({ type: 'null', kind: 'operation' })
  // EnclosingUnit can be treated as an operand only from the outside
  const isOperand = (
    unit: ExpressionUnit,
    from: 'any' | 'left' | 'right' | 'all'
  ) => {
    if (['constant', 'target'].includes(unit.type)) return true
    if (unit.type === 'null') return unit.kind === 'operand'
    if (unit.type === 'enclosing') {
      if (unit.part === 'comma') return false
      if (from === 'any') return true
      if (from === 'left') return unit.part === 'head'
      if (from === 'right') return unit.part === 'tail'
      if (from === 'all') return false
    }
    return false
  }
  const expression: ExpressionUnit[] = []
  for (const unit of ce as ExpressionUnit[]) {
    const { type } = unit
    if (!ExpressionUnitTypes.includes(type)) return undefined
    const stack_ = [...stack]
    if (type === 'constant') {
      const { value } = unit
      if (typeof value !== 'number') return undefined
    } else if (type === 'target') {
      const { target } = unit
      const target_ = validateCustomTarget(target)
      if (!target_) return undefined
    } else if (type === 'operation') {
      const { operation } = unit
      if (!NonenclosingOperations.includes(operation)) return undefined
    } else if (type === 'enclosing') {
      const { part } = unit
      if (part === 'head') {
        if (!EnclosingOperations.includes(unit.operation)) return undefined
        stack.push(unit.operation)
      } else if (part === 'comma') {
        // Condition one
        continue
      } else if (part === 'tail') {
        // Condition two
        if (!stack.pop()) continue
      }
    } else if (type === 'null') {
      const { kind } = unit
      if (!['operand', 'operation'].includes(kind)) return undefined
      // Condition one
      continue
    }

    // Condition three
    if (!isOperand(lastUnit, 'right') && !isOperand(unit, 'left')) {
      expression.push(initExpressionUnit({ type: 'null', kind: 'operand' }))
    }
    // Condition four
    if (isOperand(lastUnit, 'right') && isOperand(unit, 'left')) {
      if (stack_.length && stack_[stack_.length - 1] !== 'grouping') {
        expression.push(
          initExpressionUnit({
            type: 'enclosing',
            part: 'comma',
          })
        )
      } else {
        expression.push(initExpressionUnit({ type: 'null', kind: 'operation' }))
      }
    }

    expression.push(unit)
    lastUnit = unit
  }

  // Condition three
  if (!isOperand(lastUnit, 'right')) {
    expression.push(initExpressionUnit({ type: 'null', kind: 'operand' }))
  }

  // Condition five
  for (const _ of stack) {
    expression.push(initExpressionUnit({ type: 'enclosing', part: 'tail' }))
  }
  return expression
}

export function validateCustomMultiTarget(
  cmt: unknown
): CustomMultiTarget | undefined {
  if (typeof cmt !== 'object') return undefined
  let { name, description, targets, expression } = cmt as CustomMultiTarget
  if (typeof name !== 'string') name = 'New Custom Target'
  else if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH)
  if (typeof description !== 'string') description = undefined
  else if (description.length > MAX_DESC_LENGTH)
    description = description.slice(0, MAX_DESC_LENGTH)
  if (!Array.isArray(targets)) return undefined
  targets = targets
    .map((t) => validateCustomTarget(t))
    .filter((t): t is NonNullable<CustomTarget> => t !== undefined)
  if (expression !== undefined) {
    expression = validateCustomExpression(expression)
    if (!expression) return undefined
  }
  return { name, description, targets, expression }
}
