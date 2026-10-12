import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FilletBlade'
const dmg_Src = [-1, 2.4, 2.8, 3.2, 3.6, 4]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customDmg(
    'dmg_',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, dmg_Src)), own.premod.atk)
  )
)
