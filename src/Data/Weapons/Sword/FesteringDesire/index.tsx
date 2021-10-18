import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [16, 20, 24, 28, 32]
const refinementVals2 = [6, 7.5, 9, 10.5, 12]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    skill_dmg_: refinementVals[stats.weapon.refineIndex],
    skill_critRate_: refinementVals2[stats.weapon.refineIndex]
  }),
  document: []
}
export default weapon