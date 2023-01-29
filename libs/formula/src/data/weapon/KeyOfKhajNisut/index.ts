import { cmpEq, prod, subscript } from '@genshin-optimizer/waverider'
import { custom, percent, register, self, selfBuff, teamBuff, Weapon } from '../../util'
import { entriesForWeapon } from '../util'
import data_gen from './data.gen.json'

const selfEmSrc = [NaN, 0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const teamEmSrc = [NaN, 0.002, 0.0025, 0.003, 0.0035, 0.004]

const name: Weapon = 'KeyOfKhajNisut'
const { final, weapon: { refinement } } = self
const { afterSkillStacks } = custom
const selfElemas = prod(afterSkillStacks, percent(subscript(refinement, selfEmSrc)), final.hp_)
const teamEleMas = cmpEq(afterSkillStacks, 3, prod(percent(subscript(refinement, teamEmSrc)), final.hp))

export default register(name,
  ...entriesForWeapon(data_gen),
  selfBuff.final.eleMas.add(selfElemas),
  teamBuff.final.eleMas.add(teamEleMas),
)
