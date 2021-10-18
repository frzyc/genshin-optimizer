import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [40, 50, 60, 70, 80]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    normal_dmg_: refinementVals[stats.weapon.refineIndex],
    charged_dmg_: -10
  }),
  document: [],
}
export default weapon