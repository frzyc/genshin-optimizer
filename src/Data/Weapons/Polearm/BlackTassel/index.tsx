import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Black_Tassel.png'

const refinementVals = [40, 50, 60, 70, 80]
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
}
export default weapon