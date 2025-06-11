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

const key: WengineKey = 'CinderCobalt'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { enteringCombatOrSwitchingIn } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'enteringCombatOrSwitchingIn_atk_',
    ownBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        enteringCombatOrSwitchingIn.ifOn(percent(subscript(phase, dm.atk_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
