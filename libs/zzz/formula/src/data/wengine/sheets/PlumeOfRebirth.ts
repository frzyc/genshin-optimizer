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

const key: WengineKey = 'PlumeOfRebirth'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { anomalyCrit } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.anomProf))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      cmpSpecialtyAndEquipped(
        key,
        anomalyCrit.ifOn(percent(subscript(phase, dm.fire_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
