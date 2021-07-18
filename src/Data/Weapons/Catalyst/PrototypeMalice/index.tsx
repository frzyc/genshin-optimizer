import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Prototype_Malice.png'

const refinementVals = [4, 4.5, 5, 5.5, 6]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
}
export default weapon