import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Whiteblind'
const bonusInc = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

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
