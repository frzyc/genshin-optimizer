import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TidalShadow'
const atk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own
const { afterHeal } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    afterHeal.ifOn(percent(subscript(refinement, atk_arr)))
  )
)
