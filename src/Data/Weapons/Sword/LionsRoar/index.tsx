import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const refinementVals = [20, 24, 28, 32, 36]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "bft",
      name: "Against Opponents Affected by Pyro/Electro",
      maxStack: 1,
      stats: stats => ({
        dmg_: refinementVals[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon