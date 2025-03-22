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

const key: WengineKey = 'TheVault'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

// TODO: Add conditionals
const { ether_hit } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    // TODO: teambuff
    'cond_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(key, ether_hit.ifOn(subscript(phase, dm.dmg_)))
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
