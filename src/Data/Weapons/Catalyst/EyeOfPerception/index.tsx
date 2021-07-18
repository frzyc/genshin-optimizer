import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Eye_of_Perception.png'

const refinementVals = [240, 270, 300, 330, 360]
const refinementCdVals = [12, 11, 10, 9, 8]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
}
export default weapon