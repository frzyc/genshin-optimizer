import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Emerald_Orb.png'

const refinementVals = [20, 25, 30, 35, 40]
const conditionals : IConditionals = {
  r: {
    name: "After Hydro-Related Reactions",
    maxStack: 1,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Emerald Orb",
  weaponType: "catalyst",
  img,
  rarity: 3,
  passiveName: "Rapids",
  passiveDescription: stats => `Upon causing a Vaporize, Electro-Charged, Frozen, or a Hydro-infused Swirl reaction, increases ATK by ${refinementVals[stats.weapon.refineIndex]}% for 12s.`,
  description: " catalyst carved out of the hard jade from Jueyunjian north of Liyue. It is small, light, and durable.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    subStatKey: "eleMas",
    sub: [20, 24, 28, 32, 36, 36, 40, 44, 48, 53, 53, 57, 61, 61, 65, 69, 69, 73, 77, 77, 81, 85, 85, 90, 94],
  },
  conditionals,
}
export default weapon