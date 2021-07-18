import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Rainslasher.png'

const refinementVals = [20, 24, 28, 32, 36]
const conditionals: IConditionals = {
  bst: {
    name: "Against Opponents Affected by Hydro/Electro",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  conditionals,
}
export default weapon