import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'EyeOfPerception'
const dmg_Src = [-1, 2.4, 2.7, 3, 3.3, 3.6]

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
