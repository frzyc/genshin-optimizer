import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allNumConditionals, own, registerBuff, teamBuff } from '../../util'
import { registerDisc } from '../util'
const key: DiscSetKey = 'AstralVoice'
const { astral } = allNumConditionals(key, true, 1, 3)

const discCount = own.common.count.sheet(key)
const sheet = registerDisc(
  key,
  registerBuff(
    'set4_team_dmg_',
    teamBuff.combat.dmg_.add(cmpGE(discCount, 4, prod(astral, 0.08)))
  )
)
export default sheet
