import type {
  LunarReactionKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import type { Data, NumNode } from '../type'
import { transMulti1 } from './multi'
import { specialReactionDmgNode } from './special'

export function lunarDmgNode(
  multiplier: NumNode,
  base: 'reaction' | MainStatKey | SubstatKey,
  variant: LunarReactionKey,
  additional: Data = {},
  specialMultiplier?: NumNode
) {
  return specialReactionDmgNode(
    multiplier,
    base,
    variant,
    additional,
    lunarDmgMultiplier(base, variant),
    specialMultiplier
  )
}

function lunarDmgMultiplier(
  base: 'reaction' | MainStatKey | SubstatKey,
  variant: LunarReactionKey
) {
  if (base === 'reaction') return transMulti1
  switch (variant) {
    case 'lunarcharged':
      return 3
    case 'lunarbloom':
      return 1
    case 'lunarcrystallize':
      return 1.6
  }
}
