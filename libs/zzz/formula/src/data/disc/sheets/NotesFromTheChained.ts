import { cmpGE } from '@genshin-optimizer/pando-engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz-consts'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'NotesFromTheChained'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { triggersAbloom, triggersFreeze } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_anomProf',
    ownBuff.combat.anomProf.add(cmpGE(discCount, 4, triggersAbloom.ifOn(48))),
    showCond4Set
  ),
  registerBuff(
    'set4_anomaly_buff_',
    ownBuff.combat.buff_.addWithDmgType(
      'anomaly',
      cmpGE(discCount, 4, triggersFreeze.ifOn(percent(0.16)))
    ),
    showCond4Set
  ),
  registerBuff(
    'set4_disorder_buff_',
    ownBuff.combat.buff_.addWithDmgType(
      'disorder',
      cmpGE(discCount, 4, triggersFreeze.ifOn(percent(0.16)))
    ),
    showCond4Set
  )
)
export default sheet
