import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'PufferElectro'

const discCount = own.common.count.sheet(key)

const { launching_ult } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Passive
  registerBuff(
    'set4_dmg_',
    ownBuff.combat.dmg_.addWithDmgType('ult', cmpGE(discCount, 4, 0.2))
  ),
  // Conditional buffs
  registerBuff(
    'set4_cond_launching_ult_atk_',
    ownBuff.combat.atk_.add(cmpGE(discCount, 4, launching_ult.ifOn(0.15)))
  )
)
export default sheet
