import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MailedFlower'
const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const eleMasArr = [-1, 48, 60, 72, 84, 96]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    passive.ifOn(percent(subscript(refinement, atk_arr)))
  ),
  ownBuff.premod.eleMas.add(passive.ifOn(subscript(refinement, eleMasArr)))
)
