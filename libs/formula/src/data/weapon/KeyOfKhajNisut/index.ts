import { cmpEq, prod, subscript } from "@genshin-optimizer/waverider"
import { Data, percent, read, Weapon } from "../../util"
import { entriesForWeapon } from "../util"
import data_gen from './data.gen.json'

const selfEmSrc = [0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const teamEmSrc = [0.002, 0.0025, 0.003, 0.0035, 0.004]
const hp_arr = [0.2, 0.25, 0.3, 0.35, 0.4]

const name: Weapon = 'KeyOfKhajNisut', {
  input: { final, weapon: { refinement } },
  custom: { afterSkillStacks },
  output: { selfBuff }
} = read(name)

const selfElemas = prod(afterSkillStacks, percent(subscript(refinement, selfEmSrc)), final.hp_)
const teamEleMas = cmpEq(afterSkillStacks, 3, prod(percent(subscript(refinement, teamEmSrc)), final.hp))

const data: Data = [
  ...entriesForWeapon('KeyOfKhajNisut', data_gen),
  selfBuff.premod.hp_.addNode(subscript(refinement, hp_arr)),
  selfBuff.final.eleMas.addNode(selfElemas),
  selfBuff.final.eleMas.addNode(teamEleMas),
]
export default data
