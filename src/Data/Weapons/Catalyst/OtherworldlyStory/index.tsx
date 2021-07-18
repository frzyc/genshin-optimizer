import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Otherworldly_Story.png'

const refinementVals = [1, 1.25, 1.5, 1.75, 2]
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
}
export default weapon