import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TalkingStick'
const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const all_ele_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { affectedPyro, affectedOther } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    affectedPyro.ifOn(percent(subscript(refinement, atk_arr)))
  ),
  ...allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(
      affectedOther.ifOn(percent(subscript(refinement, all_ele_dmg_arr)))
    )
  )
)
