import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PrototypeStarglitter'
const dmgInc = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { stack } = allNumConditionals(key, true, 0, 2)
const stack_dmg_ = prod(percent(subscript(refinement, dmgInc)), stack)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(stack_dmg_),
  ownBuff.premod.dmg_.charged.add(stack_dmg_)
)
