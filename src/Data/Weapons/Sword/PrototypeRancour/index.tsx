import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const refinementVals = [4, 5, 6, 7, 8]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ss",
      name: "Normal/Charged Attack Hits",
      maxStack: 4,
      stats: stats => ({
        atk_: refinementVals[stats.weapon.refineIndex],
        def_: refinementVals[stats.weapon.refineIndex]
      }),
      fields: [{
        text: "Duration",
        value: "6s"
      }]
    }
  }],
}
export default weapon