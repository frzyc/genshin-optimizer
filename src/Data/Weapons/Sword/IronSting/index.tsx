import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const refinementVals = [6, 7.5, 9, 10.5, 12]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "is",
      name: "Elemental Hits",
      maxStack: 2,
      stats: stats => ({
        dmg_: refinementVals[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon