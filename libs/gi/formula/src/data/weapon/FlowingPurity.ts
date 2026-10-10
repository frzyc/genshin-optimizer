import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FlowingPurity'
const all_ele_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const bond_all_ele_dmg_arr = [-1, 0.02, 0.025, 0.03, 0.035, 0.04]
const bond_max_ele_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  final,
  weapon: { refinement },
} = own
const { afterSkill, bond } = allBoolConditionals(key)

const afterSkill_ele_dmg_ = afterSkill.ifOn(
  percent(subscript(refinement, all_ele_dmg_arr))
)
const hpConsumed = prod(percent(0.24), final.hp)
const bond_ele_dmg_ = bond.ifOn(
  min(
    prod(
      percent(subscript(refinement, bond_all_ele_dmg_arr)),
      prod(hpConsumed, percent(1 / 1000))
    ),
    percent(subscript(refinement, bond_max_ele_dmg_arr))
  )
)

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(afterSkill_ele_dmg_)
  ),
  allElementKeys.map((ele) => ownBuff.premod.dmg_[ele].add(bond_ele_dmg_))
)
