import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'BlazingLaurel'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { quickOrPerfectAssistUsed } = allBoolConditionals(key)
const { wilt } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'impact_',
    ownBuff.combat.impact_.add(
      cmpSpecialtyAndEquipped(
        key,
        quickOrPerfectAssistUsed.ifOn(subscript(modification, dm.impact_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'crit_dmg_ice_',
    teamBuff.combat.crit_dmg_.ice.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(wilt, subscript(modification, dm.crit_dmg_ice_fire_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'crit_dmg_fire_',
    teamBuff.combat.crit_dmg_.fire.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(wilt, subscript(modification, dm.crit_dmg_ice_fire_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
