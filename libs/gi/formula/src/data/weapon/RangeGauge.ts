import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'RangeGauge'
const atk_arr = [-1, 0.03, 0.04, 0.05, 0.06, 0.07]
const all_ele_dmg_arr = [-1, 0.07, 0.085, 0.1, 0.115, 0.13]

const {
  weapon: { refinement },
} = own
const { marksConsumed } = allNumConditionals(key, true, 0, 3)

const atk_ = prod(marksConsumed, percent(subscript(refinement, atk_arr)))
const ele_dmg_ = prod(
  marksConsumed,
  percent(subscript(refinement, all_ele_dmg_arr))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(atk_),
  allElementKeys.map((ele) => ownBuff.premod.dmg_[ele].add(ele_dmg_))
)
