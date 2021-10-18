import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [3.2, 3.9, 4.6, 5.3, 6]
const refinementDmgVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  e: {
    name: "On Hit",
    states: {
      l7: {
        name: "On Hit",
        maxStack: 6,
        stats: stats => ({
          atk_: refinementVals[stats.weapon.refineIndex]
        })
      },
      a7: {
        name: "At 7 stacks",
        stats: stats => ({
          atk_: refinementVals[stats.weapon.refineIndex] * 7,
          dmg_: refinementDmgVals[stats.weapon.refineIndex]
        })
      }
    }
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  conditionals,
  document: [{
    conditional: conditionals.e
  }],
}
export default weapon