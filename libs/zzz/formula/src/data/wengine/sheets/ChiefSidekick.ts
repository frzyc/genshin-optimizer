import { cmpEq, prod, subscript } from '@genshin-optimizer/pando-engine'
import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { mappedStats } from '@genshin-optimizer/zzz-stats'
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

const key: WengineKey = 'ChiefSidekick'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { offField } = allBoolConditionals(key)
const { fireExSpecialUsed } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_impact',
    ownBuff.combat.impact.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.impact))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'passive_fire_resIgn_',
    ownBuff.combat.resIgn_.fire.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.fire_resIgn_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_energyRegen',
    ownBuff.combat.enerRegen.add(
      cmpSpecialtyAndEquipped(
        key,
        offField.ifOn(percent(subscript(phase, dm.energyRegen)))
      )
    )
  ),
  registerBuff(
    'cond_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpEq(
          own.char.attribute,
          'fire',
          prod(fireExSpecialUsed, percent(subscript(phase, dm.common_dmg_)))
        )
      )
    ),
    undefined,
    true
  )
)
export default sheet
