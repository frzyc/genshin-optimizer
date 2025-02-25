import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'InfernoMetal'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'unique', '')

const { hitting_burning_enemy } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_cond_hitting_burning_enemy',
    ownBuff.combat.crit_.add(
      cmpGE(discCount, 4, hitting_burning_enemy.ifOn(0.28))
    ),
    showCond4Set
  )
)
export default sheet
