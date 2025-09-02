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

const key: WengineKey = 'CordisGermina'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { basic_exSpecial_used } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.passive_crit_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_electric_dmg_',
    ownBuff.combat.dmg_.electric.add(
      cmpSpecialtyAndEquipped(
        key,
        percent(prod(basic_exSpecial_used, subscript(phase, dm.electric_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_basic_defIgn_',
    ownBuff.combat.defIgn_.addWithDmgType(
      'basic',
      cmpSpecialtyAndEquipped(
        key,
        percent(
          cmpGE(
            basic_exSpecial_used,
            dm.stack_threshold,
            subscript(phase, dm.basic_ult_defIgn_)
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_ult_defIgn_',
    ownBuff.combat.defIgn_.addWithDmgType(
      'ult',
      cmpSpecialtyAndEquipped(
        key,
        percent(
          cmpGE(
            basic_exSpecial_used,
            dm.stack_threshold,
            subscript(phase, dm.basic_ult_defIgn_)
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
