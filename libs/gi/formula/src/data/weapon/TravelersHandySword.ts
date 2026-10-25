import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customHeal, own, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TravelersHandySword'
const hpRegenSrc = [-1, 0.01, 0.0125, 0.015, 0.0175, 0.02]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customHeal('heal', prod(subscript(refinement, hpRegenSrc), own.final.hp))
)
