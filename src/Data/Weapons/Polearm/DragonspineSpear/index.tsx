import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Dragonspine_Spear.png'

const refinementVals = [60, 70, 80, 90, 100]
const refinementRawDmgVals = [80, 95, 110, 125, 140]
const refinementRawDmgCryoVals = [200, 240, 280, 320, 360]
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
}
export default weapon