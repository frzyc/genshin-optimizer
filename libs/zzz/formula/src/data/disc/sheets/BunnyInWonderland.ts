import { cmpEq, cmpGE, prod } from '@genshin-optimizer/pando-engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz-consts'
import {
  allNumConditionals,
  own,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'BunnyInWonderland'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { exSpecial_assist } = allNumConditionals(key, true, 0, 3)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(
        discCount,
        4,
        cmpEq(
          own.char.specialty,
          'defense',
          prod(exSpecial_assist, percent(0.06))
        )
      )
    ),
    showCond4Set,
    true
  )
)
export default sheet
