import { WeaponKey } from '@genshin-optimizer/consts'
import { min, prod, subscript, sum } from '@genshin-optimizer/waverider'
import { allConditionals, percent, register, self, selfBuff } from '../../util'
import { entriesForWeapon, WeaponDataGen } from '../util'
import dg from './data.gen.json'

// const atkSPD_arr = [0.1, 0.125, 0.15, 0.175, 0.2]
// premod atkSPD_ = subscript(refinement, atkSPD_arr)

const data_gen = dg as WeaponDataGen
const time_normal_dmg_arr = [0.048, 0.06, 0.072, 0.084, 0.096]
const hit_normal_dmg_arr = [0.096, 0.12, 0.144, 0.168, 0.192]
const max_normal_dmg_arr = [0.48, 0.6, 0.72, 0.84, 0.96]

const name: WeaponKey = 'TulaytullahsRemembrance'
const {
  weapon: { refinement },
} = self
const { timePassive, hitPassive } = allConditionals(name)

const time_normal_dmg_ = prod(
  timePassive,
  percent(subscript(refinement, time_normal_dmg_arr))
)
const hit_normal_dmg_ = prod(
  hitPassive,
  percent(subscript(refinement, hit_normal_dmg_arr))
)

const normal_dmg_ = min(
  percent(subscript(refinement, max_normal_dmg_arr)),
  sum(time_normal_dmg_, hit_normal_dmg_)
)

export default register(
  name,
  entriesForWeapon(data_gen),
  selfBuff.premod.dmg_.normal.add(normal_dmg_)
)
