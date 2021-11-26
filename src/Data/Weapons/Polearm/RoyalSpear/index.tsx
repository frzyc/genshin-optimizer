import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const crit_ = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "f",
      name: "Opponents Damaged",
      maxStack: 5,
      stats: stats => ({
        critRate_: crit_[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon