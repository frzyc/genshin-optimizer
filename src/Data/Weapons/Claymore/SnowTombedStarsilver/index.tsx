import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Snow-Tombed_Starsilver.png'

const refinementVals = [60, 70, 80, 90, 100]
const refinementDmgVals = [80, 95, 110, 125, 140]
const refinementDmgBonusVals = [200, 240, 280, 320, 360]
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
}
export default weapon