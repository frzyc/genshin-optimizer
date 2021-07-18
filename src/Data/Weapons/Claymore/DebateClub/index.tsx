import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Debate_Club.png'

const refinementVals = [60, 75, 90, 105, 120]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
}
export default weapon