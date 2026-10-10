import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Absolution'
const dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { bondStacks } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    prod(bondStacks, percent(subscript(refinement, dmg_arr)))
  )
)
