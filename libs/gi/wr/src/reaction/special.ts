import type {
  ElementWithPhyKey,
  LunarReactionKey,
  MainStatKey,
  StellarReactionKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { transformativeReactions } from '@genshin-optimizer/gi/keymap'
import { input } from '../formula'
import { info } from '../info'
import type { Data, NumNode } from '../type'
import {
  data,
  frac,
  infoMut,
  lookup,
  max,
  min,
  naught,
  one,
  percent,
  prod,
  sum,
} from '../utils'

export function specialReactionDmg(
  multiplier: NumNode,
  base: 'reaction' | MainStatKey | SubstatKey,
  variant: LunarReactionKey | StellarReactionKey,
  additional: Data = {},
  reactionMultiplier: NumNode | number,
  specialMultiplier?: NumNode,
  resist?: ElementWithPhyKey
) {
  resist ??= transformativeReactions[variant].resist
  const transformative_dmg_ = sum(
    infoMut(sum(percent(1), prod(6, frac(input.total.eleMas, 2000))), {
      pivot: true,
      path: 'base_transformative_multi_',
    }),
    input.total[`${variant}_dmg_`]
  )
  const cappedCritRate_ = infoMut(
    max(
      min(
        sum(
          input.total.critRate_,
          input.total[`${variant}_critRate_`],
          input.total[`${resist}_critRate_`]
        ),
        one
      ),
      naught
    ),
    {
      ...info('critRate_'),
      prefix: 'total',
      pivot: true,
    }
  )

  const critDMG_ = infoMut(
    sum(
      input.total.critDMG_,
      input.total[`${variant}_critDMG_`],
      input.total[`${resist}_critDMG_`]
    ),
    {
      ...input.total.critDMG_.info,
      pivot: true,
    }
  )

  const reactionDmgInc = infoMut(
    sum(
      input.total[`${variant}_dmgInc`],
      input.total[`${variant}_reactionDmgInc`]
    ),
    { pivot: true, ...input.total[`${variant}_dmgInc`].info! }
  )
  const directDmgInc = infoMut(
    sum(
      input.total[`${variant}_dmgInc`],
      input.total[`${variant}_directDmgInc`]
    ),
    { pivot: true, ...input.total[`${variant}_dmgInc`].info! }
  )

  return data(
    prod(
      sum(
        prod(
          multiplier,
          ...(base === 'reaction' ? [] : [input.total[base]]),
          ...(specialMultiplier ? [specialMultiplier] : []),
          reactionMultiplier,
          transformative_dmg_,
          infoMut(sum(percent(1), input.total[`${variant}_baseDmg_`]), {
            path: `${variant}_baseDmg_`,
          })
        ),
        ...(base === 'reaction' ? [reactionDmgInc] : [directDmgInc])
      ),
      lookup(
        input.hit.hitMode,
        {
          hit: one,
          critHit: sum(one, critDMG_),
          avgHit: sum(one, prod(cappedCritRate_, critDMG_)),
        },
        NaN
      ),
      sum(percent(1), input.total[`${variant}_specialDmg_`]),
      input.enemy.transDef,
      input.enemy[`${resist}_resMulti_`]
    ),
    additional
  )
}
