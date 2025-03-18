import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'ElectroLipGloss'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { anomalyOnEnemy } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'atk_',
    ownBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        anomalyOnEnemy.ifOn(subscript(modification, dm.atk_))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        anomalyOnEnemy.ifOn(subscript(modification, dm.common_dmg_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
