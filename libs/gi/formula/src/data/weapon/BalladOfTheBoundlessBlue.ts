import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BalladOfTheBoundlessBlue'
const normal_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const charged_dmg_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const {
  weapon: { refinement },
} = own
const { hits } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(
    prod(hits, percent(subscript(refinement, normal_dmg_arr)))
  ),
  ownBuff.premod.dmg_.charged.add(
    prod(hits, percent(subscript(refinement, charged_dmg_arr)))
  )
)
