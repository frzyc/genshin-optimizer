import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'LunarPleniluna'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpSpecialtyAndEquipped(
        key,
        subscript(phase, dm.basic_dash_dodgeCounter_dmg_)
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'dash_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'dash',
      cmpSpecialtyAndEquipped(
        key,
        subscript(phase, dm.basic_dash_dodgeCounter_dmg_)
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'dodgeCounter_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'dodgeCounter',
      cmpSpecialtyAndEquipped(
        key,
        subscript(phase, dm.basic_dash_dodgeCounter_dmg_)
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
