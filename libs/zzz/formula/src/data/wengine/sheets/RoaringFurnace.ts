import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
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

const key: WengineKey = 'RoaringFurnace'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { chainOrUlt } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),
  registerBuff(
    'exSpecial_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'exSpecial',
      cmpSpecialtyAndEquipped(
        key,
        percent(subscript(phase, dm.exSpecial_chain_ult_dazeInc_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'chain_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'chain',
      cmpSpecialtyAndEquipped(
        key,
        percent(subscript(phase, dm.exSpecial_chain_ult_dazeInc_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'ult_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'ult',
      cmpSpecialtyAndEquipped(
        key,
        percent(subscript(phase, dm.exSpecial_chain_ult_dazeInc_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'team_chainOrUlt_fire_dmg_',
    teamBuff.combat.dmg_.fire.addOnce(
      key,
      cmpSpecialtyAndEquipped(
        key,
        prod(chainOrUlt, percent(subscript(phase, dm.fire_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
