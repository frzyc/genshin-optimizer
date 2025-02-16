import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { registerDisc } from '../util'

const key: DiscSetKey = 'ThunderMetal'

const discCount = own.common.count.sheet(key)

const { enemy_shocked } = allBoolConditionals(key)

const sheet = registerDisc(
  key,

  // Conditional buffs
  registerBuff(
    'set4_cond_enemy_shocked_atk_',
    ownBuff.combat.atk_.add(cmpGE(discCount, 2, enemy_shocked.ifOn(0.28)))
  )
)
export default sheet
