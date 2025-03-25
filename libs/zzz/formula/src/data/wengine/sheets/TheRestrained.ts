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

const key: WengineKey = 'TheRestrained'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { dmg_daze_ } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpSpecialtyAndEquipped(
        key,
        prod(dmg_daze_, subscript(phase, dm.dmg_daze_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'basic_daze_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'basic',
      cmpSpecialtyAndEquipped(
        key,
        prod(dmg_daze_, subscript(phase, dm.dmg_daze_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
