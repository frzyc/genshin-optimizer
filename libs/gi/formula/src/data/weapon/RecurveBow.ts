import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customHeal, own, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'RecurveBow'
const healing_s = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customHeal('healing', prod(own.final.hp, subscript(refinement, healing_s)))
)
