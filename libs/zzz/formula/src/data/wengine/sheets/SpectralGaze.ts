import {
  cmpGE,
  constant,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  registerBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'SpectralGaze'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { hit_aftershock_electric } = allBoolConditionals(key)
const { spiritLock } = allNumConditionals(key, true, 0, dm.max_stack)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'cond_defRed_',
    enemyDebuff.common.defRed_.add(
      cmpSpecialtyAndEquipped(
        key,
        hit_aftershock_electric.ifOn(subscript(phase, dm.defRed_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_impact_',
    own.combat.impact_.add(
      cmpSpecialtyAndEquipped(
        key,
        sum(
          prod(spiritLock, subscript(phase, dm.impact_)),
          cmpGE(
            spiritLock,
            constant(dm.max_stack),
            subscript(phase, dm.add_impact_)
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
