import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SnowTombedStarsilver'
const dmgAoePerc = [-1, 0.8, 0.95, 1.1, 1.25, 1.4]
const dmgCryoPerc = [-1, 2, 2.4, 2.8, 3.2, 3.6]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customDmg(
    'dmgAoe',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, dmgAoePerc)), own.final.atk)
  ),
  customDmg(
    'dmgOnCryoOp',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, dmgCryoPerc)), own.final.atk)
  )
)
