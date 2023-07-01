import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { prod, subscript } from '@genshin-optimizer/waverider'
import { customHeal, register, self, target } from '../../util'
import { entriesForWeapon } from '../util'

const key: WeaponKey = 'PrototypeAmber'
const data_gen = allStats.weapon.data[key]
const heal_arr = [0.04, 0.045, 0.05, 0.055, 0.06]

const name: WeaponKey = 'PrototypeAmber'
const {
  weapon: { refinement },
} = self

export default register(
  name,
  entriesForWeapon(data_gen),

  // Formulas
  customHeal('heal', prod(target.final.hp, subscript(refinement, heal_arr)), {
    team: true,
  })
)
