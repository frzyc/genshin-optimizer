import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'HormonePunk'

const discCount = own.common.count.sheet(key)

const { entering_combat } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_cond_entering_combat',
    ownBuff.combat.atk_.add(cmpGE(discCount, 4, entering_combat.ifOn(0.25)))
  )
)
export default sheet
