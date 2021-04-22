import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_The_Alley_Flash.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals : IConditionals = {
  ih: {
    name: "Not Taking DMG",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "The Alley Flash",
  weaponType: "sword",
  img,
  rarity: 4,
  passiveName: "Itinerant Hero",
  passiveDescription: stats => `Increases DMG dealt by the character equipping this weapon by ${refinementVals[stats.weapon.refineIndex]}%. Taking DMG disables this effect for 5s.`,
  description: "A straight sword as black as the night. It once belonged to a thief who roamed the benighted streets.",
  baseStats: {
    main: [45, 63, 86, 110, 134, 160, 185, 210, 235, 261, 287, 313, 340, 366, 392, 419, 445, 472, 499, 525, 552, 579, 605, 633, 660],
    subStatKey: "eleMas",
    sub: [12, 14, 16, 19, 21, 21, 24, 26, 28, 31, 31, 33, 36, 36, 38, 41, 41, 43, 45, 45, 48, 50, 50, 53, 55],
  },
  conditionals,
}
export default weapon