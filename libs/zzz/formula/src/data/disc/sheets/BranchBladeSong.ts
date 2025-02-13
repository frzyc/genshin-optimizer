import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { registerDisc } from '../util'

const key: DiscSetKey = 'BranchBladeSong'

const discCount = own.common.count.sheet(key)

const { apply_or_trigger } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  //passive
  registerBuff(
    '4p_passive',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(discCount, 4, cmpGE(own.initial.anomMas, 115, 0.3))
    )
  ),
  // Conditional buffs
  registerBuff(
    '4p_cond',
    ownBuff.combat.crit_.add(cmpGE(discCount, 4, apply_or_trigger.ifOn(0.12)))
  )
)
export default sheet
