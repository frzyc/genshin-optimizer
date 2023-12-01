import type { WeaponKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { cmpEq, prod, subscript } from '@genshin-optimizer/pando'
import { allNumConditionals, register, self, selfBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CalamityQueller'
const dmg_ = [NaN, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [NaN, 0.032, 0.04, 0.048, 0.056, 0.064]

const {
  common,
  weapon: { refinement },
} = self
const { stack } = allNumConditionals(key, 'sum', true, 0, 6)

const atkInc = prod(
  cmpEq(
    common.isActive,
    1,
    1, // TODO Add tag for active char
    2 // TODO Add tag for inactive char
  ),
  stack,
  subscript(refinement, atk_)
)

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    selfBuff.premod.dmg_[ele].add(subscript(refinement, dmg_))
  ),
  selfBuff.premod.atk_.add(atkInc)
)
