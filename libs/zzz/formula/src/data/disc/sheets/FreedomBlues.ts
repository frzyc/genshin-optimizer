import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, enemyDebuff, own, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'FreedomBlues'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { exSpecialHit } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'anomBuildupRes_',
    enemyDebuff.common.anomBuildupRes_.add(
      cmpGE(discCount, 4, exSpecialHit.ifOn(0.2))
    ),
    showCond4Set
  )
)
export default sheet
