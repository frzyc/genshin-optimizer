import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const refinementVals = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "r",
      name: "After Hydro-Related Reactions",
      maxStack: 1,
      stats: stats => ({
        atk_: refinementVals[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon