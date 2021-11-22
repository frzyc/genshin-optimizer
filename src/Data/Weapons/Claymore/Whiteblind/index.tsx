import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const atk_def_s = [6, 7.5, 9, 10.5, 12]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ib",
      name: "Normal/Charged Attack Hits",
      maxStack: 4,
      stats: stats => ({
        atk_: atk_def_s[stats.weapon.refineIndex],
        def_: atk_def_s[stats.weapon.refineIndex]
      }),
      fields: [{
        text: "Duration",
        value: "6s"
      }]
    }
  }],
}
export default weapon