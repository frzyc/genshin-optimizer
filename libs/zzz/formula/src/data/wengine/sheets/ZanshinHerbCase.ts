import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'ZanshinHerbCase'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { apply_anom_stun } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.crit_))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'passive_electric_dmg_',
    ownBuff.combat.dmg_.electric.addWithDmgType(
      'dash',
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.electric_))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(
        key,
        apply_anom_stun.ifOn(subscript(phase, dm.anom_stun_crit_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
