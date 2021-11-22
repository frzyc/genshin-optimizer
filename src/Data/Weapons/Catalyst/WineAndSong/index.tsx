import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const atk_s = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ws",
      name: "After Sprint",
      maxStack: 1,
      stats: stats => ({
        atk_: atk_s[stats.weapon.refineIndex],//TODO: stamine decrease for sprint
      })
    }
  }],
}
export default weapon