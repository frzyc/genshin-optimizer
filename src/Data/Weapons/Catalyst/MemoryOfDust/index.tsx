import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Memory_of_Dust.png'

const refinementVals = [4, 5, 6, 7, 8]
const conditionals: IConditionals = {
  gm: {
    name: "Hits on opponents",
    states: {
      wo: {
        name: "Hits without shield",
        maxStack: 5,
        stats: stats => ({
          atk_: refinementVals[stats.weapon.refineIndex]
        })
      },
      w: {
        name: "Hits with shield",
        maxStack: 5,
        stats: stats => ({
          atk_: 2 * refinementVals[stats.weapon.refineIndex]
        })
      }
    }
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  conditionals
}
export default weapon