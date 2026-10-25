import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'KingsSquire'
const eleMasArr = [-1, 60, 80, 100, 120, 140]
const dmg_arr = [-1, 1, 1.2, 1.4, 1.6, 1.8]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(passive.ifOn(subscript(refinement, eleMasArr))),
  customDmg(
    'dmg',
    undefined,
    'elemental',
    prod(percent(subscript(refinement, dmg_arr)), own.final.atk)
  )
)
