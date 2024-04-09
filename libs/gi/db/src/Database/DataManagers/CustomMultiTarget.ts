import type { MultiOptHitModeKey } from '@genshin-optimizer/gi/consts'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allInfusionAuraElementKeys,
  allMultiOptHitModeKeys,
} from '@genshin-optimizer/gi/consts'

import {
  ExpressionOperations,
  type CustomMultiTarget,
  type CustomTarget,
  type ExpressionNode,
  type ExpressionOperand,
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
export function initExpressionNode(
  args: Partial<ExpressionNode> = {}
): ExpressionNode {
  return { operation: 'addition', operands: [], ...args }
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
): ExpressionNode | undefined {
  if (!ce || typeof ce !== 'object') return undefined
  const { operation, operands } = ce as ExpressionNode
  if (!ExpressionOperations.includes(operation)) return undefined
  if (!Array.isArray(operands)) return undefined
  const operands_ = operands.map((o) =>
    typeof o === 'number'
      ? o
      : validateCustomTarget(o) ?? validateCustomExpression(o)
  )
  if (operands_.some((o): o is undefined => o === undefined)) return undefined
  const operands__ = operands_ as ExpressionOperand[]
  return { operation, operands: operands__ }
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
