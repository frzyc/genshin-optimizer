import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
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

const key: WengineKey = 'GrillOWisp'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { hpDecreased } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.fire_dmg_)))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(
        key,
        hpDecreased.ifOn(percent(subscript(phase, dm.crit_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
