import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
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
  name: "Memory of Dust",
  weaponType: "catalyst",
  img,
  rarity: 5,
  passiveName: "Golden Majesty",
  passiveDescription: stats => `Increases Shield Strength by 20%. Scoring hits on opponents increases ATK by ${refinementVals[stats.weapon.refineIndex]}% for 8s. Max 5 stacks. Can only occur once every 0.3s. While protected by a shield, this ATK increase effect is increased by 100%.`,
  description: "A stone dumbbell containing distant memories. Its endless transformations reveal the power within.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    substatKey: "atk_",
    sub: [10.8, 12.5, 14.7, 16.9, 19.1, 19.1, 21.3, 23.4, 25.6, 27.8, 27.8, 30, 32.2, 32.2, 34.4, 36.5, 36.5, 38.7, 40.9, 40.9, 43.1, 45.3, 45.3, 47.4, 49.6],
  },
  conditionals
}
export default weapon