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

const key: WengineKey = 'CrimsonMoonCasket'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { windExSpecialUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.crit_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'passive_wind_resIgn_',
    ownBuff.combat.resIgn_.wind.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.wind_resIgn_)))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'cond_dazeInc_',
    ownBuff.combat.dazeInc_.add(
      cmpSpecialtyAndEquipped(
        key,
        windExSpecialUsed.ifOn(percent(subscript(phase, dm.dazeInc_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        windExSpecialUsed.ifOn(percent(subscript(phase, dm.dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key),
    true
  )
)
export default sheet
