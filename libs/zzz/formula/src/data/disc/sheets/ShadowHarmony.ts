import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ShadowHarmony'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { stacks } = allNumConditionals(key, true, 0, 3)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_stack_atk_',
    ownBuff.combat.atk_.add(cmpGE(discCount, 4, prod(stacks, 0.04))),
    showCond4Set
  ),
  registerBuff(
    'set4_stack_crit_',
    ownBuff.combat.crit_.add(cmpGE(discCount, 4, prod(stacks, 0.04))),
    showCond4Set
  )
)
export default sheet
