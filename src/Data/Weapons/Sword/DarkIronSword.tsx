import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Dark_Iron_Sword.png'

const refinementVals = [20, 25, 30, 35, 40]
const conditionals : IConditionals = {
  em: {
    name: "After Electro-related reactions",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Dark Iron Sword",
  weaponType: "sword",
  img,
  rarity: 3,
  passiveName: "Elemental Mastery",
  passiveDescription: stats => `Upon causing an Overloaded, Superconduct, Electro-Charged, or an Electro-infused Swirl reaction, ATK is increased by ${refinementVals[stats.weapon.refineIndex]}% for 12s`,
  description: "A perfectly ordinary iron sword, just slightly darker than most.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "eleMas",
    sub: [31, 36, 42, 48, 54, 54, 60, 66, 73, 79, 79, 85, 91, 91, 97, 104, 104, 110, 116, 116, 122, 128, 128, 134, 141],
  },
  conditionals,
}
export default weapon