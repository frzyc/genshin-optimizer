import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "r",
      name: "Elemental Skill Resets CD",
      maxStack: 1,
      stats: () => ({
        cdRed_: 100
      })
    }
  }]
}
export default weapon