import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  own,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'MoonlightLullaby'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { exSpecial_ult_used } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(
        discCount,
        4,
        cmpEq(
          own.char.specialty,
          'support',
          exSpecial_ult_used.ifOn(percent(0.18))
        )
      )
    ),
    showCond4Set,
    true
  )
)
export default sheet
