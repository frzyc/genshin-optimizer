import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { registerDisc } from '../util'

const key: DiscSetKey = 'ChaoticMetal'

const discCount = own.common.count.sheet(key)

const { trigger_corruption } = allBoolConditionals(key)
const sheet = registerDisc(
  key,
  //passive
  registerBuff(
    'set4_passive',
    ownBuff.combat.crit_dmg_.add(cmpGE(discCount, 4, 0.2))
  ),
  // Conditional buffs
  registerBuff(
    'set4_cond_trigger_corruption',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(discCount, 4, trigger_corruption.ifOn(0.2))
    )
  )
)
export default sheet
