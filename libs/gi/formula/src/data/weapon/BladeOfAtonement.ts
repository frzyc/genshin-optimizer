import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BladeOfAtonement'
const eleMasArr = [-1, 64, 80, 96, 112, 128]
const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { react } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(react.ifOn(subscript(refinement, eleMasArr))),
  ownBuff.premod.atk_.add(react.ifOn(percent(subscript(refinement, atk_arr))))
)
