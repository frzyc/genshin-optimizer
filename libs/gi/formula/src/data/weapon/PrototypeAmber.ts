import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customHeal, own, register, target } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PrototypeAmber'
const heal_arr = [0.04, 0.045, 0.05, 0.055, 0.06]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  customHeal('heal', prod(target.final.hp, subscript(refinement, heal_arr)), {
    team: true,
  }),
)
