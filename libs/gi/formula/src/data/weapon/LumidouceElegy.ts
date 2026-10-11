import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'LumidouceElegy'
const dmg_arr = [-1, 0.18, 0.23, 0.28, 0.33, 0.38]

const {
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 2)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(prod(percent(subscript(refinement, dmg_arr)), stacks))
)
