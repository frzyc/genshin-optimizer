import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Kitain_Cross_Spear.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
const skill_dmg_s = [6, 7.5, 9, 10.5, 12]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    skill_dmg_: skill_dmg_s[stats.weapon.refineIndex]
  }),
  document: []
}
export default weapon