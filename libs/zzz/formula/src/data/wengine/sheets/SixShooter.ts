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

const key: WengineKey = 'SixShooter'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { charge } = allNumConditionals(key, true, 0, dm.max_stack)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'exSpecial_daze_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'exSpecial',
      cmpSpecialtyAndEquipped(key, prod(charge, subscript(phase, dm.daze_)))
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
