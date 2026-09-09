import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SacrificialJade'
const hp_arr = [-1, 0.32, 0.4, 0.48, 0.56, 0.64]
const eleMasArr = [-1, 40, 50, 60, 70, 80]

const {
  weapon: { refinement },
} = own
const { offField } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.hp_.add(offField.ifOn(percent(subscript(refinement, hp_arr)))),
  ownBuff.premod.eleMas.add(offField.ifOn(subscript(refinement, eleMasArr)))
)
