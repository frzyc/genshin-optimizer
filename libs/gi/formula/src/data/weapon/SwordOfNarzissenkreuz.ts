import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SwordOfNarzissenkreuz'
const dmg_arr = [-1, 1.6, 2, 2.4, 2.8, 3.2]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customDmg(
    'dmg',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, dmg_arr)), own.final.atk)
  )
)
