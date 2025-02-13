import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, registerBuff } from '../../util'
import { registerDisc } from '../util'

const key: DiscSetKey = 'ChaosJazz'

const discCount = own.common.count.sheet(key)

const { inflict_assault } = allBoolConditionals(key)

const sheet = registerDisc(
  key,

  // Conditional buffs
  registerBuff(
    'set4_dmg_',
    own.combat.dmg_.add(cmpGE(discCount, 4, inflict_assault.ifOn(0.3)))
  )
)
export default sheet
