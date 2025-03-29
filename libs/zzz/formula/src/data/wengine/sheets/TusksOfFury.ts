import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
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

const key: WengineKey = 'TusksOfFury'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { interrupt_perfdodge } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_shield_',
    ownBuff.combat.shield_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.shield_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'cond_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        interrupt_perfdodge.ifOn(subscript(phase, dm.dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'daze_',
    teamBuff.combat.dazeInc_.add(
      cmpSpecialtyAndEquipped(
        key,
        interrupt_perfdodge.ifOn(subscript(phase, dm.daze_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
