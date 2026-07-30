import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'FeatheredFate'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { entersOrActive } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_anomProf',
    ownBuff.combat.anomProf.add(cmpGE(discCount, 4, entersOrActive.ifOn(50))),
    showCond4Set
  ),
  registerBuff(
    'set4_buff_',
    ownBuff.combat.buff_.addWithDmgType(
      'anomaly',
      cmpGE(
        discCount,
        4,
        entersOrActive.ifOn(cmpEq(own.char.attribute, 'lumiflux', 0.15))
      )
    ),
    showCond4Set
  )
)
export default sheet
