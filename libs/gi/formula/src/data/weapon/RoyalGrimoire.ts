import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'RoyalGrimoire'
const crit_ = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { stack } = allNumConditionals(key, true, 0, 5)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critRate_.add(
    prod(stack, percent(subscript(refinement, crit_)))
  )
)
