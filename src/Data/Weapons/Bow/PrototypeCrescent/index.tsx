import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const atk_s = [36, 45, 54, 63, 72]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "u",
      name: "Against Weak Points",
      maxStack: 1,
      stats: stats => ({
        moveSPD_: 10,
        atk_: atk_s[stats.weapon.refineIndex]
      }),
    }
  }],
}
export default weapon