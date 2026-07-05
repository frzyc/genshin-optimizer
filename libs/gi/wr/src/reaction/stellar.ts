import type {
  MainStatKey,
  StellarReactionKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { input } from '../formula'
import type { Data, NumNode } from '../type'
import { one, sum } from '../utils'
import { transMulti1 } from './multi'
import { specialReactionDmg } from './special'

type StellarVariants = {
  stellarconduct: 'electro' | 'cryo'
}
export function stellarDmg(
  multiplier: NumNode,
  base: 'reaction' | MainStatKey | SubstatKey,
  variant: StellarReactionKey,
  eleVariant: StellarVariants[typeof variant],
  additional: Data = {},
  specialMultiplier?: NumNode
) {
  return specialReactionDmg(
    multiplier,
    base,
    variant,
    additional,
    stellarDmgMultiplier(base, variant),
    specialMultiplier,
    eleVariant
  )
}

function stellarDmgMultiplier(
  base: 'reaction' | MainStatKey | SubstatKey,
  variant: StellarReactionKey
) {
  if (base === 'reaction') return transMulti1
  switch (variant) {
    case 'stellarconduct':
      return sum(one, input.total[`${variant}_mult_`])
  }
}
