import { prod, subscript } from '@genshin-optimizer/pando/engine'
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

const key: WengineKey = 'BellicoseBlaze'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { fire_aftershocks } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.passive_crit_)))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'cond_fire_aftershock_defIgn_',
    ownBuff.combat.defIgn_.fire.addWithDmgType(
      'aftershock',
      cmpSpecialtyAndEquipped(
        key,
        percent(prod(fire_aftershocks, subscript(phase, dm.defIgn_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
