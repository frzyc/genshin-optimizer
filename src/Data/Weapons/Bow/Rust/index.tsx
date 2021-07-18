import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Rust.png'

const refinementVals = [40, 50, 60, 70, 80]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    normal_dmg_: refinementVals[stats.weapon.refineIndex],
    charged_dmg_: -10
  }),
  document: [],
}
export default weapon