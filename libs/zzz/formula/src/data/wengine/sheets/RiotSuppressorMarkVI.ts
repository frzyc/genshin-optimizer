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

const key: WengineKey = 'RiotSuppressorMarkVI'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { charge } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.passive_crit_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'basic_ether_dmg_',
    ownBuff.combat.dmg_.ether.addWithDmgType(
      'basic',
      cmpSpecialtyAndEquipped(
        key,
        charge.ifOn(subscript(phase, dm.basic_ether_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
