import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ProtoPunk'

const discCount = own.common.count.sheet(key)

const { def_assist_or_evasive_assist } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_cond_def_assist_or_evasive_assist_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(discCount, 2, def_assist_or_evasive_assist.ifOn(0.15))
    )
  )
)
export default sheet
