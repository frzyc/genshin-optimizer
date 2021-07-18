import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Frostbearer.png'

const refinementChanceVals = [60, 70, 80, 90, 100]
const refinementDmgVals = [80, 95, 110, 125, 140]
const refinementDmgCryoVals = [200, 240, 280, 320, 360]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
}
export default weapon