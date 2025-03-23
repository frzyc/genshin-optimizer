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

const key: WengineKey = 'UnfetteredGameBall'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { anomaly_counter } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'cond_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(
        key,
        anomaly_counter.ifOn(subscript(phase, dm.crit_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
