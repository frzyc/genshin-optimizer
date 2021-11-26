import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [12, 15, 18, 21, 24]
const refinementDmgVals = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    normal_dmg_: refinementVals[stats.weapon.refineIndex],
    charged_dmg_: refinementVals[stats.weapon.refineIndex]
  }),
  document: [{
    conditional: {
      key: "sw",
      name: "Arrow Flight Duration (0.1s / stack)",
      maxStack: 5,
      stats: stats => ({
        normal_dmg_: refinementDmgVals[stats.weapon.refineIndex],
        charged_dmg_: refinementDmgVals[stats.weapon.refineIndex]
      }),
    }
  }],
}
export default weapon