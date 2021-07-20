import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Favonius_Sword.png'

const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  document: []
}
export default weapon