import { cmpEq, cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'FrostfallSickle'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { specialUsed } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'cond_ice_dmg_',
    ownBuff.combat.common_dmg_.ice.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpEq(
          own.char.attribute,
          'ice',
          prod(specialUsed, percent(subscript(phase, dm.ice_dmg_)))
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_abloom_dmg_',
    ownBuff.combat.common_dmg_.addWithDmgType(
      'abloom',
      cmpSpecialtyAndEquipped(
        key,
        cmpEq(
          own.char.attribute,
          'ice',
          cmpGE(
            specialUsed,
            dm.stack_threshold,
            percent(subscript(phase, dm.abloom_dmg_))
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
