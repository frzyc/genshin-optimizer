import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import Deathmatch from './Weapon_Deathmatch.png'
const refinementVals = [16, 20, 24, 28, 32]
const refinementSoloVals = [24, 30, 36, 42, 48]
const conditionals: IConditionals = {
  g: {
    name: "",
    states: {
      o2: {
        name: "At least 2 opponents",
        stats: stats => ({
          atk_: refinementVals[stats.weapon.refineIndex],
          def_: refinementVals[stats.weapon.refineIndex]
        })
      },
      o1: {
        name: "Less than 2 opponents",
        stats: stats => ({
          atk_: refinementSoloVals[stats.weapon.refineIndex]
        })
      }
    }
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img: Deathmatch, conditionals
}
export default weapon