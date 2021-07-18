import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Silver_Sword.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
}
export default weapon