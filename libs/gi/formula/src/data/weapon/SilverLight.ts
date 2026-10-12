import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SilverLight'
const eleMasArr = [-1, 52, 65, 78, 91, 104]

const {
  weapon: { refinement },
} = own
const { passive } = allNumConditionals(key, true, 0, 2)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(prod(passive, subscript(refinement, eleMasArr)))
)
