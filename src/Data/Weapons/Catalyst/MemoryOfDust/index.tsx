import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

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
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  conditionals,
  document: [{
    conditional: conditionals.gm
  }],
}
export default weapon