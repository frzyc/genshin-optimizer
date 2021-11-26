import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [2, 2.5, 3, 3.5, 4]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ug",
      name: "Duration not on Field (1s / stack)",
      maxStack: 10,
      stats: stats => ({
        dmg_: refinementVals[stats.weapon.refineIndex],
      })
    }
  }],
}
export default weapon