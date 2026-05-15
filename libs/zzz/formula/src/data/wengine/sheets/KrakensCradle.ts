import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
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

const key: WengineKey = 'KrakensCradle'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { hpBelow50 } = allBoolConditionals(key)
const { hpDecreased } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'ice_sheer_dmg_',
    ownBuff.combat.sheer_dmg_.ice.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(hpDecreased, percent(subscript(phase, dm.ice_sheer_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(
        key,
        hpBelow50.ifOn(percent(subscript(phase, dm.crit_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
