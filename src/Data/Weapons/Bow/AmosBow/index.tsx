import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Amos\'_Bow.png'

const refinementVals = [12, 15, 18, 21, 24]
const refinementDmgVals = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  sw: {
    name: "Arrow Flight Duration (0.1s / stack)",
    maxStack: 5,
    stats: stats => ({
      normal_dmg_: refinementDmgVals[stats.weapon.refineIndex],
      charged_dmg_: refinementDmgVals[stats.weapon.refineIndex]
    }),
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    normal_dmg_: refinementVals[stats.weapon.refineIndex],
    charged_dmg_: refinementVals[stats.weapon.refineIndex]
  }),
  conditionals,
}
export default weapon