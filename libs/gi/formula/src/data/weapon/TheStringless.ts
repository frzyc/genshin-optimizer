import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheStringless'
const refinementVals = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(percent(subscript(refinement, refinementVals))),
  ownBuff.premod.dmg_.burst.add(percent(subscript(refinement, refinementVals)))
)
