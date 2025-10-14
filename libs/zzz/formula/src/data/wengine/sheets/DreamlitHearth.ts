import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'DreamlitHearth'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { etherVeilActive } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'enerRegen',
    ownBuff.combat.enerRegen.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.enerRegen)))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        etherVeilActive.ifOn(percent(subscript(phase, dm.common_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key),
    true
  ),
  registerBuff(
    'hp_',
    teamBuff.combat.hp_.add(
      cmpSpecialtyAndEquipped(
        key,
        etherVeilActive.ifOn(percent(subscript(phase, dm.hp_)))
      )
    ),
    showSpecialtyAndEquipped(key),
    true
  )
)
export default sheet
