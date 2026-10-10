import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'IronSting'
const allDmgInc = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const {
  weapon: { refinement },
} = own
const { InfusionStinger } = allNumConditionals(key, true, 0, 2)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    prod(InfusionStinger, percent(subscript(refinement, allDmgInc)))
  )
)
