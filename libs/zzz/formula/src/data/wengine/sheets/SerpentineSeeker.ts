import { subscript } from '@genshin-optimizer/pando-engine'
import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { mappedStats } from '@genshin-optimizer/zzz-stats'
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

const key: WengineKey = 'SerpentineSeeker'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { energyConsumed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.crit_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_electric_defIgn_',
    ownBuff.combat.defIgn_.electric.add(
      cmpSpecialtyAndEquipped(
        key,
        energyConsumed.ifOn(percent(subscript(phase, dm.electric_defIgn_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
