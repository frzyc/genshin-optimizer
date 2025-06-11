import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
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

const key: WengineKey = 'QingmingBirdcage'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { qingmingCompanionStacks } = allNumConditionals(
  key,
  true,
  0,
  dm.maxStacks
)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  registerBuff(
    'crit_',
    ownBuff.combat.crit_.add(
      cmpSpecialtyAndEquipped(key, percent(subscript(phase, dm.crit_)))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'qingmingCompanionStacks_ether_dmg_',
    ownBuff.combat.dmg_.ether.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(qingmingCompanionStacks, percent(subscript(phase, dm.ether_dmg_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'qingmingCompanionStacks_ult_ether_sheer_dmg_',
    [
      teamBuff.combat.dmg_.ether
        .withTag({ damageType1: 'ult', damageType2: 'sheer' })
        .add(
          cmpSpecialtyAndEquipped(
            key,
            prod(
              qingmingCompanionStacks,
              percent(subscript(phase, dm.ult_exSpecial_sheer_ether_dmg_))
            )
          )
        ),
      teamBuff.combat.dmg_.ether
        .withTag({ damageType1: 'sheer', damageType2: 'ult' })
        .add(
          cmpSpecialtyAndEquipped(
            key,
            prod(
              qingmingCompanionStacks,
              percent(subscript(phase, dm.ult_exSpecial_sheer_ether_dmg_))
            )
          )
        ),
    ],
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'qingmingCompanionStacks_exSpecial_ether_sheer_dmg_',
    [
      teamBuff.combat.dmg_.ether
        .withTag({ damageType1: 'exSpecial', damageType2: 'sheer' })
        .add(
          cmpSpecialtyAndEquipped(
            key,
            prod(
              qingmingCompanionStacks,
              percent(subscript(phase, dm.ult_exSpecial_sheer_ether_dmg_))
            )
          )
        ),
      teamBuff.combat.dmg_.ether
        .withTag({ damageType1: 'sheer', damageType2: 'exSpecial' })
        .add(
          cmpSpecialtyAndEquipped(
            key,
            prod(
              qingmingCompanionStacks,
              percent(subscript(phase, dm.ult_exSpecial_sheer_ether_dmg_))
            )
          )
        ),
    ],
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
