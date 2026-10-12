import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PrimordialJadeWingedSpear'
const atkInc = [-1, 0.032, 0.039, 0.046, 0.053, 0.06]
const allDmgInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { stack } = allNumConditionals(key, true, 0, 7)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(prod(stack, percent(subscript(refinement, atkInc)))),
  ownBuff.premod.dmg_.add(
    cmpEq(stack, 7, percent(subscript(refinement, allDmgInc)))
  )
)
