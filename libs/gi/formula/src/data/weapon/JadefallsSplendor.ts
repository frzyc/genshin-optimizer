import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'JadefallsSplendor'
const ele_dmg_arr = [-1, 0.003, 0.005, 0.007, 0.009, 0.011]
const maxEle_dmg_arr = [-1, 0.12, 0.2, 0.28, 0.36, 0.44]

const {
  char: { ele: charEle },
  final,
  weapon: { refinement },
} = own
const { condPassive } = allBoolConditionals(key)

const ele_dmg_ = condPassive.ifOn(
  min(
    percent(subscript(refinement, maxEle_dmg_arr)),
    prod(percent(subscript(refinement, ele_dmg_arr)), final.hp, 1 / 1000)
  )
)

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(cmpEq(charEle, ele, ele_dmg_))
  )
)
