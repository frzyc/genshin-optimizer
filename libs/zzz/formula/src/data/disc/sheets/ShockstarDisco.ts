import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { enemyDebuff, own, percent, registerBuff } from '../../util'
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
    enemyDebuff.common.stun_.addWithDmgType(
      'basic',
      cmpGE(discCount, 4, percent(0.2))
    ),
    showCond4Set
  )
  // TODO: add daze_
)
export default sheet
