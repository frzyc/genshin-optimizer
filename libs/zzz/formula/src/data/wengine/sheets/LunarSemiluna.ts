import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'LunarSemiluna'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'cond_basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpSpecialtyAndEquipped(
        key,
        exSpecialUsed.ifOn(percent(subscript(phase, dm.basic_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
