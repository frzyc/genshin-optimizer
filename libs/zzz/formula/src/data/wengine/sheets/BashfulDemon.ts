import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
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
const { modification } = own.wengine

const { launch_ex_attack } = allNumConditionals(key, true, 0, 4)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // passive buffs
  registerBuff(
    'ice_dmg_',
    ownBuff.combat.dmg_.ice.add(
      cmpSpecialtyAndEquipped(
        key,
        subscript(modification, [-1, 0.15, 0.175, 0.2, 0.22, 0.24])
      )
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'team_atk_',
    teamBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(
          launch_ex_attack,
          subscript(modification, [-1, 0.02, 0.023, 0.026, 0.029, 0.032])
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
