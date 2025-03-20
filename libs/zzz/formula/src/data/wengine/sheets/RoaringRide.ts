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

const key: WengineKey = 'RoaringRide'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { atk_, anomProf } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'atk_',
    ownBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(key, atk_.ifOn(subscript(phase, dm.atk_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(key, anomProf.ifOn(subscript(phase, dm.anomProf)))
    ),
    showSpecialtyAndEquipped(key)
  )
  // TODO: add anomaly build up rate
)
export default sheet
