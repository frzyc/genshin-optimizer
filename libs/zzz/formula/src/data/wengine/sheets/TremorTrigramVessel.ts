import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { own, ownBuff, percent, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'TremorTrigramVessel'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  registerBuff(
    'exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpSpecialtyAndEquipped(
        key,
        percent(subscript(phase, dm.exSpecial_ult_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpSpecialtyAndEquipped(
        key,
        percent(subscript(phase, dm.exSpecial_ult_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
