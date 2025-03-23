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

const key: WengineKey = 'SpringEmbrace'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { when_attacked } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_dmg_red_',
    ownBuff.combat.dmg_red_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.dmg_red_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    // TODO: teambuff
    'cond_enerRegen_',
    teamBuff.combat.enerRegen_.add(
      cmpSpecialtyAndEquipped(
        key,
        when_attacked.ifOn(subscript(phase, dm.enerRegen_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
