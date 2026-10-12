import { cmpEq, cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'WutheringSalon'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { windsweptTriggered } = allBoolConditionals(key)
const { exSpecialUsed } = allNumConditionals(key, true, 0, 2)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_anomProf',
    ownBuff.combat.anomProf.add(cmpGE(discCount, 4, prod(exSpecialUsed, 25))),
    showCond4Set
  ),
  registerBuff(
    'set4_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(
        discCount,
        4,
        cmpEq(own.char.attribute, 'wind', windsweptTriggered.ifOn(0.18))
      )
    ),
    showCond4Set
  )
)
export default sheet
