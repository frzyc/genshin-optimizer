import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Alley_Hunter.png'

const refinementVals = [2, 2.5, 3, 3.5, 4]
const conditionals : IConditionals = {
  ug: {
    name: "Duration not on Field (1s / stack)",
    maxStack: 10,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex],
    })
  }
}
const weapon : WeaponSheet = {
  name: "Alley Hunter",
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: "Urban Guerrilla",
  passiveDescription: stats => `While the character equipped with this weapon is in the party but not on the field, their DMG increases by ${refinementVals[stats.weapon.refineIndex]}% every second up to a max of ${refinementVals[stats.weapon.refineIndex] * 10}%. When the character is on the field for more than 4s, the aforementioned DMG buff decreases by ${refinementVals[stats.weapon.refineIndex] * 2}% per second until it reaches 0%.`,
  description: "An intricate, opulent longbow. It once belonged to a gentleman thief who was never caught.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "atk_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  conditionals,
}
export default weapon