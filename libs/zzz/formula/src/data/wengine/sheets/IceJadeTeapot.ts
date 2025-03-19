import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'IceJadeTeapot'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { teariffic } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'impact_',
    ownBuff.combat.impact_.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(teariffic, subscript(modification, dm.impact_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpGE(
          teariffic,
          dm.stackThreshold,
          subscript(modification, dm.common_dmg_)
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
