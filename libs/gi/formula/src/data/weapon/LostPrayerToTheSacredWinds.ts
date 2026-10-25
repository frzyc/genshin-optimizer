import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'LostPrayerToTheSacredWinds'
const ele_dmg_s = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { BoundlessBlessing } = allNumConditionals(key, true, 0, 4)

const eleDmgInc = prod(
  BoundlessBlessing,
  percent(subscript(refinement, ele_dmg_s))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.moveSPD_.add(percent(0.1)),
  allElementKeys.map((ele) => ownBuff.premod.dmg_[ele].add(eleDmgInc))
)
