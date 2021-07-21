import { WeaponData } from 'pipeline'
// import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Hakushin_Ring.png'

// const refinementVals = [20, 25, 30, 35, 40]
// const conditionals: IConditionals = {
//   r: {
//     name: "After Electro Elemental Reaction",
//     maxStack: 1,
//     stats: stats => ({
//       atk_: refinementVals[stats.weapon.refineIndex]
//     })
//   }
// }//TODO: party elemental bonus
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  // conditionals,
  // document: [{
  //   conditional: conditionals.r
  // }],
  document: [],
}
export default weapon