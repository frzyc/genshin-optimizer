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

const key: WengineKey = 'CloudcleaveRadiance'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { activatesEtherVeil } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'passive_physical_resIgn_',
    ownBuff.combat.resIgn_.physical.add(
      cmpSpecialtyAndEquipped(
        key,
        percent(subscript(phase, dm.physical_resIgn_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        activatesEtherVeil.ifOn(percent(subscript(phase, dm.common_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        activatesEtherVeil.ifOn(percent(subscript(phase, dm.crit_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
