import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Messenger'
const dmg_s = [-1, 1, 1.25, 1.5, 1.75, 2]

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
    prod(subscript(refinement, dmg_s), own.final.atk)
  )
)
