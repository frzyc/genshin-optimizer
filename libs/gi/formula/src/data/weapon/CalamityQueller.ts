import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  register,
  self,
  selfBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CalamityQueller'
const dmg_ = [NaN, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [NaN, 0.032, 0.04, 0.048, 0.056, 0.064]

const {
  weapon: { refinement },
} = self
const { stack } = allNumConditionals(key, 'sum', true, 0, 6)
const { isActive } = allBoolConditionals(key)

const atkInc = prod(isActive.ifOn(1, 2), stack, subscript(refinement, atk_))

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    selfBuff.premod.dmg_[ele].add(subscript(refinement, dmg_))
  ),
  selfBuff.premod.atk_.add(atkInc)
)
