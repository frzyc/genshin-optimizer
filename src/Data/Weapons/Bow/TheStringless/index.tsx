import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [24, 30, 36, 42, 48]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    skill_dmg_: refinementVals[stats.weapon.refineIndex],
    burst_dmg_: refinementVals[stats.weapon.refineIndex]
  }),
  document: [],
}
export default weapon