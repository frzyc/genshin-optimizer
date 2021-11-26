import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const refinementVals = [14, 17.5, 21, 24.5, 28]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "v",
      name: "HP > 90%",
      maxStack: 1,
      stats: stats => ({
        critRate_: refinementVals[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon