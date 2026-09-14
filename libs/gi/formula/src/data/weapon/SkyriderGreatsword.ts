import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SkyriderGreatsword'
const bonusInc = [-1, 0.06, 0.07, 0.08, 0.09, 0.1]

const {
  weapon: { refinement },
} = own
const { stack } = allNumConditionals(key, true, 0, 4)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(prod(stack, percent(subscript(refinement, bonusInc))))
)
