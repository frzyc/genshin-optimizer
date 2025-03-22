import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
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

const key: WengineKey = 'FlamemakerShaker'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { offField } = allBoolConditionals(key)
const { exSpecialAssistHits } = allNumConditionals(key, true, 0, dm.stacks)

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
    'common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(
          exSpecialAssistHits,
          subscript(phase, dm.common_dmg_),
          offField.ifOn(2, 1)
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(
          exSpecialAssistHits,
          dm.stackThreshold,
          subscript(phase, dm.anomProf)
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
