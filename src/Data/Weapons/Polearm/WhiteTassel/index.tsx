import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_White_Tassel.png'

const dmg_ = [24, 30, 36, 42, 48]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    normal_dmg_: dmg_[stats.weapon.refineIndex]
  }),
  document: []
}
export default weapon