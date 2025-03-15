import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'BashfulDemon'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { launch_ex_attack } = allNumConditionals(key, true, 0, 4)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // passive buffs
  registerBuff(
    'passive_ice_dmg_',
    ownBuff.combat.dmg_.ice.add(
      cmpSpecialtyAndEquipped(key, subscript(modification, dm.ice_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'team_atk_',
    teamBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(launch_ex_attack, subscript(modification, dm.atk_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
