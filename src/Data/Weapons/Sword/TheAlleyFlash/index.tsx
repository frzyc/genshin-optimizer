import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const refinementVals = [12, 15, 18, 21, 24]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ih",
      name: "Not Taking DMG",
      maxStack: 1,
      stats: stats => ({
        dmg_: refinementVals[stats.weapon.refineIndex]
      })
    }
  }]
}
export default weapon