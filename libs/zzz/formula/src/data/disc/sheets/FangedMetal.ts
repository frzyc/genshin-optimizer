import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'FangedMetal'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'unique', '')

const { inflict_assault } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),
  // Conditional buffs
  registerBuff(
    'set4_cond_inflict_assault',
    ownBuff.combat.common_dmg_.add(
      cmpGE(discCount, 4, inflict_assault.ifOn(0.35))
    ),
    showCond4Set
  )
)
export default sheet
