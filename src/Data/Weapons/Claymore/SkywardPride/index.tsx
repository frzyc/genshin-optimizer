import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Skyward_Pride.png'

const refinementVals = [8, 10, 12, 14, 16]
const refinementDmgVals = [80, 100, 120, 140, 160]
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  stats: stats => ({
    dmg_: refinementVals[stats.weapon.refineIndex]
  })
}
export default weapon