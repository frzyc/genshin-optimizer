import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Primordial_Jade_Cutter.png'

const refinementVals_hp = [20, 25, 30, 35, 40]
const refinementVals_hp_Atk = [1.2, 1.5, 1.8, 2.1, 2.4]
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  stats: stats => ({
    hp_: refinementVals_hp[stats.weapon.refineIndex],
    modifiers: { finalATK: { finalHP: refinementVals_hp_Atk[stats.weapon.refineIndex] / 100 } }
  }),
  document: []
}
export default weapon