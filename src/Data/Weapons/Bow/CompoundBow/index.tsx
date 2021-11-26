import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [4, 5, 6, 7, 8]
const refinementSpdVals = [1.2, 1.5, 1.8, 2.1, 2.4]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ia",
      name: "Normal/Charged Attack Hits",
      maxStack: 4,
      stats: stats => ({
        atk_: refinementVals[stats.weapon.refineIndex],
        atkSPD_: refinementSpdVals[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon