import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'EndOfTheLine'
const dmgArr = [-1, 0.8, 1, 1.2, 1.4, 1.6]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customDmg(
    'dmg',
    undefined,
    'elemental',
    prod(percent(subscript(refinement, dmgArr)), own.final.atk)
  )
)
