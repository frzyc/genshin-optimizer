import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FruitfulHook'
const plunging_critRate_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { afterPlunging } = allBoolConditionals(key)
const auto_dmg_ = afterPlunging.ifOn(percent(subscript(refinement, dmg_arr)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critRate_.plunging.add(
    percent(subscript(refinement, plunging_critRate_arr))
  ),
  ownBuff.premod.dmg_.normal.add(auto_dmg_),
  ownBuff.premod.dmg_.charged.add(auto_dmg_),
  ownBuff.premod.dmg_.plunging.add(auto_dmg_)
)
