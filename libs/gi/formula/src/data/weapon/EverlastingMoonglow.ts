import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'EverlastingMoonglow'
const hp_conv = [-1, 0.01, 0.015, 0.02, 0.025, 0.03]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.formula.base.normal.add(
    prod(percent(subscript(refinement, hp_conv)), own.premod.hp)
  )
)
