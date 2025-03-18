import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'HeartstringNocturne'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { heartstring } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        subscript(modification, dm.passive_crit_dmg_)
      )
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'chain_resIgn_fire_',
    ownBuff.combat.resIgn_.fire.addWithDmgType(
      'chain',
      cmpSpecialtyAndEquipped(
        key,
        prod(heartstring, subscript(modification, dm.chain_ult_resIgn_fire_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'ult_resIgn_fire_',
    ownBuff.combat.resIgn_.fire.addWithDmgType(
      'ult',
      cmpSpecialtyAndEquipped(
        key,
        prod(heartstring, subscript(modification, dm.chain_ult_resIgn_fire_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
