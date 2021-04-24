import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Lithic_Spear.png'

const refinementCritVals = [3, 4, 5, 6, 7]
const refinementAtkVals = [7, 8, 9, 10, 11]
const conditionals : IConditionals = {
  lau: {
    name: "Liyue Members",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementAtkVals[stats.weapon.refineIndex],
      critRate_: refinementCritVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Lithic Spear",
  weaponType: "polearm",
  img,
  rarity: 4,
  passiveName: "Lithic Axiom - Unity",
  passiveDescription: stats => `For every character in the party who hails from Liyue, the character who equips this weapon gains ${refinementAtkVals[stats.weapon.refineIndex]}% ATK increase and ${refinementCritVals[stats.weapon.refineIndex]}% CRIT Rate increase. This effect stacks up to 4 times.`,
  description: "A spear forged from the rocks of the Guyun Stone Forest. Its hardness knows no equal.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "atk_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  conditionals,
}
export default weapon