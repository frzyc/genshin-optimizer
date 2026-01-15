import { cmpGE, constant } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { isStunned } from '../../common/enemy'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ShiningAria'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { enemyHit } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_anomProf',
    ownBuff.combat.anomProf.add(
      cmpGE(discCount, 4, enemyHit.ifOn(constant(36)))
    ),
    showCond4Set
  ),
  registerBuff(
    'set4_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(discCount, 4, isStunned.ifOn(percent(0.25)))
    ),
    showCond4Set
  )
)
export default sheet
