import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Seasoned_Hunter\'s_Bow.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  document: [],
}
export default weapon