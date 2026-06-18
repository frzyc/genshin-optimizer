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

const key: DiscSetKey = 'TheSkyAblaze'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { exSpecialUltUsed } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(discCount, 4, cmpEq(own.char.attribute, 'ether', percent(0.3)))
    ),
    showCond4Set
  ),
  registerBuff(
    'set4_atk_',
    ownBuff.combat.atk_.add(exSpecialUltUsed.ifOn(percent(0.1))),
    showCond4Set
  )
)
export default sheet
