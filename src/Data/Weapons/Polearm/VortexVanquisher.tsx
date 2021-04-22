import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Vortex_Vanquisher.png'

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
const weapon: WeaponSheet = {
  name: "Vortex Vanquisher",
  weaponType: "polearm",
  img,
  rarity: 5,
  passiveName: "Golden Majesty",
  passiveDescription: stats => `Increases Shield Strength by ${refinementVals[stats.weapon.refineIndex]}%. Scoring hits on opponents increases ATK by ${refinementVals[stats.weapon.refineIndex]}% for 8s. Max 5 stacks. Can only occur once every 0.3s. While protected by a shield, this ATK increase effect is increased by 100%.`,
  description: "This sharp polearm can seemingly pierce through anything. When swung, one can almost see the rift it tears in the air.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    subStatKey: "atk_",
    sub: [10.8, 12.5, 14.7, 16.9, 19.1, 19.1, 21.3, 23.4, 25.6, 27.8, 27.8, 30, 32.2, 32.2, 34.4, 36.5, 36.5, 38.7, 40.9, 40.9, 43.1, 45.3, 45.3, 47.4, 49.6],
  },
  stats: stats => ({
    powShield_: refinementVals[stats.weapon.refineIndex]
  }),
  conditionals
}
export default weapon