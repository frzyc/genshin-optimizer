import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, customHeal, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AquilaFavonia'
const atkDealt = [-1, 2, 2.3, 2.6, 2.9, 3.2]
const hpRegen = [-1, 1, 1.15, 1.3, 1.45, 1.6]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customHeal('heal', prod(subscript(refinement, hpRegen), own.premod.atk)),
  customDmg(
    'dmg',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, atkDealt)), own.premod.atk)
  )
)
