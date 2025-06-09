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

const key: WengineKey = 'PuzzleSphere'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { launchingExSpecial, targetHpBelow50 } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'launchingExSpecial_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        launchingExSpecial.ifOn(percent(subscript(phase, dm.crit_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'targetHpBelow50_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpSpecialtyAndEquipped(
        key,
        targetHpBelow50.ifOn(percent(subscript(phase, dm.exSpecial_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
