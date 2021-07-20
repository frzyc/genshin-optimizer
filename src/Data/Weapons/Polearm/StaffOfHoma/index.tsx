import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Staff_of_Homa.png'

const refinementVals_hp = [20, 25, 30, 35, 40]
const refinementVals_hp_atk = [0.8, 1, 1.2, 1.4, 1.6]
const refinementVals_hp_atk_add = [1, 1.2, 1.4, 1.6, 1.8]
const conditionals: IConditionals = {
  esj: {
    name: "HP < 50%",
    maxStack: 1,
    stats: stats => ({
      modifiers: { finalATK: { finalHP: refinementVals_hp_atk_add[stats.weapon.refineIndex] / 100 } }
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    hp_: refinementVals_hp[stats.weapon.refineIndex],
    modifiers: { finalATK: { finalHP: refinementVals_hp_atk[stats.weapon.refineIndex] / 100 } }
  }),
  conditionals,
  document: [{
    conditional: conditionals.esj
  }],
}
export default weapon