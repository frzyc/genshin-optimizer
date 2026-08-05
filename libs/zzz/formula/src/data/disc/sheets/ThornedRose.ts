import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { own, ownBuff, percent, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ThornedRose'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_dmg_',
    ownBuff.combat.common_dmg_.add(cmpGE(discCount, 4, percent(0.15))),
    showCond4Set
  ),
  registerBuff(
    'set4_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(
        discCount,
        4,
        cmpGE(
          own.initial.def,
          1800,
          percent(0.16),
          cmpGE(own.initial.def, 1000, percent(0.08))
        )
      )
    ),
    showCond4Set
  )
)
export default sheet
