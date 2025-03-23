import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'HellfireGears'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { offField } = allBoolConditionals(key)
const { exSpecialUsed } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'enerRegen',
    ownBuff.combat.enerRegen.add(
      cmpSpecialtyAndEquipped(
        key,
        offField.ifOn(subscript(phase, dm.enerRegen))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'impact_',
    ownBuff.combat.impact_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(exSpecialUsed, subscript(phase, dm.impact_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
