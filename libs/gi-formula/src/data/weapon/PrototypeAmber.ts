import type { WeaponKey } from '@genshin-optimizer/consts'
import { prod, subscript } from '@genshin-optimizer/pando'
import { customHeal, register, self, target } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PrototypeAmber'
const heal_arr = [0.04, 0.045, 0.05, 0.055, 0.06]

const {
  weapon: { refinement },
} = self

export default register(
  key,
  entriesForWeapon(key),
  customHeal('heal', prod(target.final.hp, subscript(refinement, heal_arr)), {
    team: true,
  })
)
