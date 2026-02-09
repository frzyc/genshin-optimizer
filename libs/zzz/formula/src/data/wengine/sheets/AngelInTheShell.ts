import { cmpEq, subscript } from '@genshin-optimizer/pando/engine'
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

const key: WengineKey = 'AngelInTheShell'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { onFieldOrSpecialUsed, enemyAnomaly } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.anomProf)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        onFieldOrSpecialUsed.ifOn(
          cmpEq(
            own.char.attribute,
            'ether',
            enemyAnomaly.ifOn(percent(subscript(phase, dm.common_dmg_)))
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_anomaly_dmg_',
    ownBuff.combat.buff_.addWithDmgType(
      'anomaly',
      cmpSpecialtyAndEquipped(
        key,
        cmpSpecialtyAndEquipped(
          key,
          onFieldOrSpecialUsed.ifOn(
            cmpEq(
              own.char.attribute,
              'ether',
              percent(subscript(phase, dm.anomaly_dmg_))
            )
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
