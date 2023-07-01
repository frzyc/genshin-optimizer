import type { WeaponKey } from '@genshin-optimizer/consts'
import { cmpEq, prod, subscript } from '@genshin-optimizer/waverider'
import {
  allConditionals,
  percent,
  register,
  self,
  selfBuff,
  teamBuff,
} from '../../util'

const key: WeaponKey = 'KeyOfKhajNisut'
const selfEmSrc = [NaN, 0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const teamEmSrc = [NaN, 0.002, 0.0025, 0.003, 0.0035, 0.004]

const {
  final,
  weapon: { refinement },
} = self
const { afterSkillStacks } = allConditionals(key)
const selfElemas = prod(
  afterSkillStacks,
  percent(subscript(refinement, selfEmSrc)),
  final.hp_
)
const teamEleMas = cmpEq(
  afterSkillStacks,
  3,
  prod(percent(subscript(refinement, teamEmSrc)), final.hp)
)

export default register(
  key,
  selfBuff.final.eleMas.add(selfElemas),
  teamBuff.final.eleMas.add(teamEleMas)
)
