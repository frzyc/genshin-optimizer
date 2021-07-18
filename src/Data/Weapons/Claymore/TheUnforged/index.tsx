import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_The_Unforged.png'

const refinementVals = [20, 25, 30, 35, 40]
const refinementAtkVals = [4, 5, 6, 7, 8]
const conditionals: IConditionals = {
  gm: {
    name: "Hits",
    states: {
      wo: {
        name: "Without shield",
        maxStack: 5,
        stats: stats => ({
          atk_: refinementAtkVals[stats.weapon.refineIndex]
        })
      },
      w: {
        name: "With shield",
        maxStack: 5,
        stats: stats => ({
          atk_: 2 * refinementAtkVals[stats.weapon.refineIndex]
        })
      }
    }
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  stats: stats => ({
    powShield_: refinementVals[stats.weapon.refineIndex]
  }),
  conditionals
}
export default weapon