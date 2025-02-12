import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allNumConditionals,
  own,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
const key: DiscSetKey = 'AstralVoice'
const { astral } = allNumConditionals(key, true, 1, 3)

const relicCount = own.common.count.sheet(key)
const sheet = register(
  key,
  registerBuff(
    'team_dmg_',
    teamBuff.combat.dmg_.add(cmpGE(relicCount, 4, prod(astral, 0.08)))
  )
)
export default sheet
