import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ChaoticMetal'

const discCount = own.common.count.sheet(key)

const { trigger_corruption } = allNumConditionals(key, true, 0, 6)
const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),
  //passive
  registerBuff(
    'set4_passive',
    ownBuff.combat.crit_dmg_.add(cmpGE(discCount, 4, 0.2))
  ),
  // Conditional buffs
  registerBuff(
    'set4_cond_trigger_corruption',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(discCount, 4, prod(trigger_corruption, 0.055))
    )
  )
)
export default sheet
