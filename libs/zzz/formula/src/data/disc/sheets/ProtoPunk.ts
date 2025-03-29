import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ProtoPunk'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { def_assist_or_evasive_assist } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_cond_def_assist_or_evasive_assist_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(discCount, 4, def_assist_or_evasive_assist.ifOn(percent(0.15)))
    ),
    showCond4Set
  )
)
export default sheet
