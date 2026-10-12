import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'LuxuriousSeaLord'
const burst_dmg_Src = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const dmg_Src = [-1, 1, 1.25, 1.5, 1.75, 2]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.burst.add(percent(subscript(refinement, burst_dmg_Src))),
  customDmg(
    'dmg',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, dmg_Src)), own.final.atk)
  )
)
