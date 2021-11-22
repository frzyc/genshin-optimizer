import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const atk_s = [16, 20, 24, 28, 32]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ww",
      name: "After Elemental Skill",
      maxStack: 1,
      stats: stats => ({
        atk_: atk_s[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon