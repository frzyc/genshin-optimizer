import type { MultiOptHitModeKey } from '@genshin-optimizer/gi/consts'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allInfusionAuraElementKeys,
  allMultiOptHitModeKeys,
} from '@genshin-optimizer/gi/consts'

import type {
  CustomMultiTarget,
  CustomTarget,
} from '../../Interfaces/CustomMultiTarget'
import type { InputPremodKey } from '../../legacy/keys'
import { allInputPremodKeys } from '../../legacy/keys'

const MAX_NAME_LENGTH = 200
const MAX_DESC_LENGTH = 2000
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
export function validateCustomMultiTarget(
  cmt: unknown
): CustomMultiTarget | undefined {
  if (typeof cmt !== 'object') return undefined
  let { name, description, targets } = cmt as CustomMultiTarget
  if (typeof name !== 'string') name = 'New Custom Target'
  else if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH)
  if (typeof description !== 'string') description = undefined
  else if (description.length > MAX_DESC_LENGTH)
    description = description.slice(0, MAX_DESC_LENGTH)
  if (!Array.isArray(targets)) return undefined
  targets = targets
    .map((t) => validateCustomTarget(t))
    .filter((t): t is NonNullable<CustomTarget> => t !== undefined)
  return { name, description, targets }
}
