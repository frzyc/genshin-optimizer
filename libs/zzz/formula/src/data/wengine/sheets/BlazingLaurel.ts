import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '@genshin-optimizer/zzz/stats'
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
const { modification } = own.wengine
const params = getWengineParams(key)

const { quickOrPerfectAssistUsed } = allBoolConditionals(key)
const { wilt } = allNumConditionals(key, true, 0, params[3][1])

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
        quickOrPerfectAssistUsed.ifOn(subscript(modification, params[0]))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'crit_dmg_ice_',
    teamBuff.combat.crit_dmg_.ice.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(wilt, subscript(modification, params[4]))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'crit_dmg_fire_',
    teamBuff.combat.crit_dmg_.fire.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(wilt, subscript(modification, params[4]))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
