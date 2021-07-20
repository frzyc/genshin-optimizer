import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Quartz.png'

const atk_s = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  rh: {
    name: "After Pyro-related Reactions",
    stats: stats => ({
      atk_: atk_s[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.rh
  }],
}
export default weapon