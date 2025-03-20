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

const key: WengineKey = 'DeepSeaVisitor'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { basicHit, iceDashAtkHit } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_ice_dmg_',
    ownBuff.combat.dmg_.ice.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.passive_ice_dmg_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, basicHit.ifOn(subscript(phase, dm.crit_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'extra_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(
        key,
        iceDashAtkHit.ifOn(subscript(phase, dm.extra_crit_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
