import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Halberd.png'

const refinementVals = [160, 200, 240, 280, 320]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
}
export default weapon