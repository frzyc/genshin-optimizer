import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'WoodpeckerElectro'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { crit_basic_dodge_ex } = allNumConditionals(key, true, 0, 3)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_cond_crit_basic_dodge_ex_atk_',
    ownBuff.combat.atk_.add(
      cmpGE(discCount, 4, prod(percent(0.09), crit_basic_dodge_ex))
    ),
    showCond4Set
  )
)
export default sheet
