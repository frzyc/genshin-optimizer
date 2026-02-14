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

const key: WengineKey = 'CauldronOfClarity'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialActivated } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'cond_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(exSpecialActivated, percent(subscript(phase, dm.common_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(
          exSpecialActivated,
          dm.stackThreshold,
          percent(subscript(phase, dm.crit_))
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
