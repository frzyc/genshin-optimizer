import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allNumConditionals, own, registerBuff, teamBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'
const key: DiscSetKey = 'AstralVoice'
const { astral } = allNumConditionals(key, true, 0, 3)

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'unique', '')

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),
  registerBuff(
    'set4_team_dmg_',
    teamBuff.combat.common_dmg_.add(cmpGE(discCount, 4, prod(astral, 0.08))),
    showCond4Set
  )
)
export default sheet
