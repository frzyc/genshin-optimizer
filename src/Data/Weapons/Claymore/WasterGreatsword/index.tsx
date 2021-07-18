import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Waster_Greatsword.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
}
export default weapon