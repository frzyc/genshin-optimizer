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

const key: WengineKey = 'DemaraBatteryMarkII'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { dodgeCounterOrAssistHit } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_electric_dmg_',
    ownBuff.combat.dmg_.electric.add(
      cmpSpecialtyAndEquipped(
        key,
        subscript(modification, dm.passive_electric_dmg_)
      )
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'enerRegen_',
    ownBuff.combat.enerRegen_.add(
      cmpSpecialtyAndEquipped(
        key,
        dodgeCounterOrAssistHit.ifOn(subscript(modification, dm.enerRegen_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
