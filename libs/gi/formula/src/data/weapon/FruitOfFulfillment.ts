import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FruitOfFulfillment'
const eleMasArr = [-1, 24, 27, 30, 33, 36]

const {
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 5)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(prod(stacks, subscript(refinement, eleMasArr))),
  ownBuff.premod.atk_.add(prod(stacks, percent(-0.05)))
)
