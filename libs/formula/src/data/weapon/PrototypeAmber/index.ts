import { WeaponKey } from '@genshin-optimizer/consts'
import { prod, subscript } from '@genshin-optimizer/waverider'
import { register, self, target } from '../../util'
import { customHeal, entriesForWeapon, WeaponDataGen } from '../util'
import dg from './data.gen.json'

const data_gen = dg as WeaponDataGen
const heal_arr = [0.04, 0.045, 0.05, 0.055, 0.06]

const name: WeaponKey = 'PrototypeAmber'
const { weapon: { refinement } } = self

const heal = customHeal("heal", name, prod(target.final.hp, subscript(refinement, heal_arr)))

export default register(name,
  entriesForWeapon(data_gen),
  heal
)
