import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, registerBuff, teamBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'SwingJazz'

const discCount = own.common.count.sheet(key)

const { chain_or_ult } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_cond_chain_or_ult',
    teamBuff.combat.common_dmg_.add(
      cmpGE(discCount, 4, chain_or_ult.ifOn(0.15))
    )
  )
)
export default sheet
