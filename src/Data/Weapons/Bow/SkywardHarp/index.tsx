import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Skyward_Harp.png'

const refinementVals = [20, 25, 30, 35, 40]
const refinementChangeVals = [60, 70, 80, 90, 100]
const refinementCD = [4, 3.5, 3, 2.5, 2]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    critDMG_: refinementVals[stats.weapon.refineIndex]
  })
}
export default weapon