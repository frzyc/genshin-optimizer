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

const key: WengineKey = 'WrathfulVajra'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialAssistLaunched } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.crit_))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_fire_sheer_dmg_',
    ownBuff.combat.sheer_dmg_.fire.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(
          exSpecialAssistLaunched,
          percent(subscript(phase, dm.fire_sheer_dmg_))
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
