import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ShockstarDisco'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Passives
  registerBuff(
    'set4_basic_daze_',
    ownBuff.combat.dazeInc_.addWithDmgType('basic', cmpGE(discCount, 4, 0.2)),
    showCond4Set
  ),
  registerBuff(
    'set4_dash_daze_',
    ownBuff.combat.dazeInc_.addWithDmgType('dash', cmpGE(discCount, 4, 0.2)),
    showCond4Set
  ),
  registerBuff(
    'set4_dodgeCounter_daze_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'dodgeCounter',
      cmpGE(discCount, 4, 0.2)
    ),
    showCond4Set
  )
)
export default sheet
