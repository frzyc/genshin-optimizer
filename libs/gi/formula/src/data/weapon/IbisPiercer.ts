import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'IbisPiercer'
const emArr = [-1, 40, 50, 60, 70, 80]

const {
  weapon: { refinement },
} = own
const { passiveStacks } = allNumConditionals(key, true, 0, 2)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(prod(passiveStacks, subscript(refinement, emArr)))
)
