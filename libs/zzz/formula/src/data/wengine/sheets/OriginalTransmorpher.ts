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

const key: WengineKey = 'OriginalTransmorpher'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { equipperHit } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_hp_',
    ownBuff.combat.hp_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.passive_hp_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'impact_',
    ownBuff.combat.impact_.add(
      cmpSpecialtyAndEquipped(
        key,
        equipperHit.ifOn(subscript(phase, dm.impact_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
