import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'LunarDecrescent'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { chainOrUltUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        chainOrUltUsed.ifOn(subscript(modification, dm.common_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
