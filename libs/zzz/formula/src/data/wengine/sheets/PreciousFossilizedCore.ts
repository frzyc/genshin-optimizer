import { subscript, sum } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'PreciousFossilizedCore'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { enemyHpGE50, enemyHpGE75 } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'daze_',
    ownBuff.combat.dazeInc_.add(
      cmpSpecialtyAndEquipped(
        key,
        enemyHpGE50.ifOn(
          sum(
            subscript(phase, dm.daze_),
            enemyHpGE75.ifOn(subscript(phase, dm.extra_daze_))
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
