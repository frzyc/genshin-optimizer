import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CompoundBow'
const atk_s = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]
const atkSPD_s = [-1, 0.012, 0.015, 0.018, 0.021, 0.024]

const {
  weapon: { refinement },
} = own
const { InfusionArrow } = allNumConditionals(key, true, 0, 4)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(InfusionArrow, percent(subscript(refinement, atk_s)))
  ),
  ownBuff.premod.atkSPD_.add(
    prod(InfusionArrow, percent(subscript(refinement, atkSPD_s)))
  )
)
