import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheViridescentHunt'
const dmgPerc_s = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

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
    prod(subscript(refinement, dmgPerc_s), own.final.atk)
  )
)
