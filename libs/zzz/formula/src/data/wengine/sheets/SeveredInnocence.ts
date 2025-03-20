import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'SeveredInnocence'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { basicSpecialAftershockHit } = allNumConditionals(
  key,
  true,
  0,
  dm.stacks
)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.passive_crit_dmg_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(basicSpecialAftershockHit, subscript(phase, dm.crit_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'electric_dmg_',
    ownBuff.combat.dmg_.electric.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(
          basicSpecialAftershockHit,
          dm.stackThreshold,
          subscript(phase, dm.electric_dmg_)
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
