import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'UltimateOverlordsMegaMagicSword'
const atk2_arr = [-1, 0.01, 0.0125, 0.015, 0.0175, 0.02]

const {
  weapon: { refinement },
} = own
const { melusines } = allNumConditionals(key, true, 0, 12)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(melusines, percent(subscript(refinement, atk2_arr)))
  )
)
