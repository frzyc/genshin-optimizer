import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Twin_Nephrite.png'

const refinementVals = [12, 14, 16, 18, 20]
const conditionals: IConditionals = {
  gt: {
    name: "Opponents Defeated",
    maxStack: 1,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex],
      moveSPD_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
}
export default weapon