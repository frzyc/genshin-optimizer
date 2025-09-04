import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'DawnsBloom'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { exSpecial_ult_used } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Passive
  registerBuff(
    'set4_basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpGE(discCount, 4, percent(0.2))
    ),
    showCond4Set
  ),
  // Conditional buffs
  registerBuff(
    'set4_extra_basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpGE(
        discCount,
        4,
        cmpEq(
          own.char.specialty,
          'attack',
          exSpecial_ult_used.ifOn(percent(0.2))
        )
      )
    ),
    showCond4Set
  )
)
export default sheet
