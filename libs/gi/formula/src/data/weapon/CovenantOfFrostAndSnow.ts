import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CovenantOfFrostAndSnow'
const eleMasArr = [-1, 120, 150, 180, 210, 240]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(passive.ifOn(subscript(refinement, eleMasArr)))
)
