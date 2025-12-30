import { cmpEq, cmpGE, sum } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'WhiteWaterBallad'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { inEtherVeil, activateExtendVeil } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(
        discCount,
        4,
        sum(
          inEtherVeil.ifOn(percent(0.1)),
          cmpEq(
            own.char.specialty,
            'attack',
            activateExtendVeil.ifOn(percent(0.1))
          )
        )
      )
    ),
    showCond4Set
  ),
  registerBuff(
    'set4_atk_',
    ownBuff.combat.atk_.add(
      cmpEq(own.char.specialty, 'attack', activateExtendVeil.ifOn(percent(0.1)))
    ),
    showCond4Set
  )
)
export default sheet
