import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const dmg_s = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "is",
      name: "Elemental Reactions",
      maxStack: 2,
      stats: stats => ({
        dmg_: dmg_s[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon