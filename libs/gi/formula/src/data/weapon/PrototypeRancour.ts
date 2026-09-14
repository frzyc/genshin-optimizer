import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PrototypeRancour'
const bonusInc = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]

const {
  weapon: { refinement },
} = own
const { stack } = allNumConditionals(key, true, 0, 4)

const bonus_ = prod(stack, percent(subscript(refinement, bonusInc)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(bonus_),
  ownBuff.premod.def_.add(bonus_)
)
