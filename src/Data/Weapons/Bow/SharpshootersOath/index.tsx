import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Sharpshooter\'s_Oath.png'

const refinementVals = [24, 30, 36, 42, 48]
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  stats: stats => ({
    weakspotDMG_: refinementVals[stats.weapon.refineIndex]
  })
}
export default weapon