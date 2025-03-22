import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'Timeweaver'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { hit_anomaly } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // TODO: Electric Anomaly Buildup Rate
  registerBuff(
    'passive_disorder_dmg_',
    ownBuff.combat.common_dmg_.addWithDmgType(
      'disorder',
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(
          own.final.anomProf,
          dm.anomProf_thresh,
          subscript(phase, dm.disorder_dmg_)
        )
      )
    )
  ),
  // Conditional buffs
  registerBuff(
    'cond_anomProf',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        hit_anomaly.ifOn(subscript(phase, dm.anomProf))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
