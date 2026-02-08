import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'Thoughtbop'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { offField } = allBoolConditionals(key)
const { physExSpecialUsed } = allNumConditionals(key, true, 0, dm.maxStacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'cond_enerRegen',
    ownBuff.combat.enerRegen.add(
      cmpSpecialtyAndEquipped(
        key,
        offField.ifOn(percent(subscript(phase, dm.enerRegen)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'team_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(physExSpecialUsed, percent(subscript(phase, dm.common_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key),
    true
  ),
  registerBuff(
    'team_atk_',
    teamBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(physExSpecialUsed, dm.stackThreshold, subscript(phase, dm.atk_))
      )
    ),
    showSpecialtyAndEquipped(key),
    true
  )
)
export default sheet
