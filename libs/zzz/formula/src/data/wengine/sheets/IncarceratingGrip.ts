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

const key: WengineKey = 'IncarceratingGrip'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { basicHits } = allBoolConditionals(key)

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
  // Conditional buffs
  registerBuff(
    'cond_atk_',
    ownBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        basicHits.ifOn(percent(subscript(phase, dm.atk_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_wind_resIgn_',
    ownBuff.combat.resIgn_.wind.add(
      cmpSpecialtyAndEquipped(
        key,
        basicHits.ifOn(percent(subscript(phase, dm.wind_resIgn_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
