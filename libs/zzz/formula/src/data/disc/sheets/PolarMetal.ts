import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'PolarMetal'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

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
      cmpGE(discCount, 4, prod(percent(0.2), freeze_shatter.ifOn(2, 1)))
    ),
    showCond4Set
  ),
  registerBuff(
    'set4_dash_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'dash',
      cmpGE(discCount, 4, prod(percent(0.2), freeze_shatter.ifOn(2, 1)))
    ),
    showCond4Set
  )
)
export default sheet
