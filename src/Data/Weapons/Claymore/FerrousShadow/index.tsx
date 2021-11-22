import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const dmg_s = [30, 35, 40, 45, 50]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "u",
      name: "Low HP",
      maxStack: 1,
      stats: stats => ({
        charged_dmg_: dmg_s[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon