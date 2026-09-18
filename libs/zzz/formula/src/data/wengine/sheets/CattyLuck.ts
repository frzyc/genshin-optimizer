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

const key: WengineKey = 'CattyLuck'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_def_',
    ownBuff.combat.def_.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.def_)))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'cond_def_',
    ownBuff.combat.def_.add(
      cmpSpecialtyAndEquipped(
        key,
        exSpecialUsed.ifOn(percent(subscript(phase, dm.addl_def_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
