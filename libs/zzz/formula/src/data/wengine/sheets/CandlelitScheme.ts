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

const key: WengineKey = 'CandlelitScheme'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialUsed, enemyHpBelowHalf } = allBoolConditionals(key)

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
        exSpecialUsed.ifOn(percent(subscript(phase, dm.crit_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        enemyHpBelowHalf.ifOn(percent(subscript(phase, dm.dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
