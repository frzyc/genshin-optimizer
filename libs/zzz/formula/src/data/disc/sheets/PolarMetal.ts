import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'PolarMetal'

const discCount = own.common.count.sheet(key)

const { freeze_shatter } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Passive + conditional
  registerBuff(
    'set4_basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpGE(discCount, 4, prod(0.2, freeze_shatter.ifOn(2, 1)))
    )
  ),
  registerBuff(
    'set4_dash_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'dash',
      cmpGE(discCount, 4, prod(0.2, freeze_shatter.ifOn(2, 1)))
    )
  )
)
export default sheet
