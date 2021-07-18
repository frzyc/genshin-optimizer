import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Wolf\'s_Gravestone.png'

const refinementVals = [20, 25, 30, 35, 40]
const refinementPartyAtkVal = [40, 50, 60, 70, 80]
const conditionals: IConditionals = {
  wt: {
    name: "Attacked Opponent with Low HP",
    maxStack: 1,
    stats: stats => ({
      atk_: refinementPartyAtkVal[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    atk_: refinementVals[stats.weapon.refineIndex]
  }),
  conditionals,
}
export default weapon