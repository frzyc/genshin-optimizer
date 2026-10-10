import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TulaytullahsRemembrance'
const atkSPD_arr = [Number.NaN, 0.1, 0.125, 0.15, 0.175, 0.2]
const time_normal_dmg_arr = [Number.NaN, 0.048, 0.06, 0.072, 0.084, 0.096]
const hit_normal_dmg_arr = [Number.NaN, 0.096, 0.12, 0.144, 0.168, 0.192]
const max_normal_dmg_arr = [Number.NaN, 0.48, 0.6, 0.72, 0.84, 0.96]

const {
  weapon: { refinement },
} = own
const { timePassive } = allNumConditionals(key, false, 0, 12)
const { hitPassive } = allNumConditionals(key, true, 0, 5)

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
  key,
  entriesForWeapon(key),
  ownBuff.premod.atkSPD_.add(percent(subscript(refinement, atkSPD_arr))),
  ownBuff.premod.dmg_.normal.add(normal_dmg_)
)
