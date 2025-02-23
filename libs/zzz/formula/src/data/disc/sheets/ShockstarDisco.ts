import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { enemyDebuff, own, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'ShockstarDisco'

const discCount = own.common.count.sheet(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Passives
  registerBuff(
    'set4_basic_daze_',
    enemyDebuff.common.stun_.addWithDmgType('basic', cmpGE(discCount, 4, 0.2))
  ),
  registerBuff(
    'set4_dash_daze_',
    enemyDebuff.common.stun_.addWithDmgType('dodge', cmpGE(discCount, 4, 0.2))
  ),
  registerBuff(
    'set4_dodgeCounter_daze_',
    enemyDebuff.common.stun_.addWithDmgType(
      'dodgeCounter',
      cmpGE(discCount, 4, 0.2)
    )
  )
)
export default sheet
