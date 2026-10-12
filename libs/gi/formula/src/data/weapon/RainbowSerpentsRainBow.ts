import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'RainbowSerpentsRainBow'
const atk_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(passive.ifOn(percent(subscript(refinement, atk_arr))))
)
