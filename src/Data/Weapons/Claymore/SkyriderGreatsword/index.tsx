import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const atk_s = [6, 7, 8, 9, 10]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "c",
      name: "Normal/Charged Attack Hits",
      maxStack: 4,
      stats: stats => ({
        atk_: atk_s[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon