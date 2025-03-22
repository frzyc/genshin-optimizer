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

const key: WengineKey = 'MarcatoDesire'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialOrChainHitsEnemy, attributeAnomalyInflicted } =
  allBoolConditionals(key)

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
        exSpecialOrChainHitsEnemy.ifOn(
          sum(
            subscript(phase, dm.atk_),
            attributeAnomalyInflicted.ifOn(subscript(phase, dm.extra_atk_))
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
