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

const key: WengineKey = 'Housekeeper'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { offField } = allBoolConditionals(key)
const { exSpecialHits } = allNumConditionals(key, true, 0, dm.stacks)

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
    'physical_dmg_',
    ownBuff.combat.dmg_.physical.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(exSpecialHits, subscript(phase, dm.physical_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
