import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
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

const key: WengineKey = 'KnightsExtolment'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { battleEdge } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'cond_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(battleEdge, percent(subscript(phase, dm.crit_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_ice_resIgn_',
    ownBuff.combat.resIgn_.ice.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(
          battleEdge,
          dm.stackThreshold,
          percent(subscript(phase, dm.ice_resIgn_))
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
