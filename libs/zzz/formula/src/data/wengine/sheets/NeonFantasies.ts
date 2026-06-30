import { cmpGE, prod, subscript } from '@genshin-optimizer/pando-engine'
import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { mappedStats } from '@genshin-optimizer/zzz-stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'NeonFantasies'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { ether_exSpecial_basic } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'passive_anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.anomProf))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(ether_exSpecial_basic, percent(subscript(phase, dm.common_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key),
    true
  ),
  registerBuff(
    'cond_anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(
          ether_exSpecial_basic,
          dm.stackThreshold,
          subscript(phase, dm.cond_anomProf)
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
