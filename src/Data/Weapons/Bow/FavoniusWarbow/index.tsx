import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Favonius_Warbow.png'

// const refinementVals = [60, 70, 80, 90, 100]
// const refinementCdVals = [12, 10.5, 9, 7.5, 6]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  document: [],
}
export default weapon