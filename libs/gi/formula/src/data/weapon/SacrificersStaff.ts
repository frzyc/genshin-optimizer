import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SacrificersStaff'
const atk_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const enerRech_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const {
  weapon: { refinement },
} = own
const { passive } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(passive, percent(subscript(refinement, atk_arr)))
  ),
  ownBuff.premod.enerRech_.add(
    prod(passive, percent(subscript(refinement, enerRech_arr)))
  )
)
