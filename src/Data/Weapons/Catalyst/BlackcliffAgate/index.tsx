import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Blackcliff_Amulet.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  pa: {
    name: "Opponents Defeated",
    maxStack: 3,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals
}
export default weapon