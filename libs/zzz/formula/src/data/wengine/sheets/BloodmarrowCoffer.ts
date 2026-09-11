import {
  constant,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { own, ownBuff, percent, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'BloodmarrowCoffer'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        min(
          percent(subscript(phase, dm.max_dmg_)),
          prod(
            max(0, sum(own.final.crit_, percent(-dm.crit_threshold))),
            constant(100),
            percent(subscript(phase, dm.dmg_))
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
