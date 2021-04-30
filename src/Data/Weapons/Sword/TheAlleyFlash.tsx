import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_The_Alley_Flash.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  ih: {
    name: "Not Taking DMG",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "The Alley Flash",
  weaponType: "sword",
  img,
  rarity: 4,
  passiveName: "Itinerant Hero",
  passiveDescription: stats => `Increases DMG dealt by the character equipping this weapon by ${refinementVals[stats.weapon.refineIndex]}%. Taking DMG disables this effect for 5s.`,
  description: "A straight sword as black as the night. It once belonged to a thief who roamed the benighted streets.",
  baseStats: {
    main: [45, 62, 84, 106, 128, 154, 177, 200, 224, 247, 273, 297, 321, 347, 371, 395, 421, 445, 470, 496, 520, 545, 571, 595, 620],
    substatKey: "eleMas",
    sub: [12, 14, 16, 19, 21, 21, 24, 26, 28, 31, 31, 33, 36, 36, 38, 41, 41, 43, 45, 45, 48, 50, 50, 53, 55],
  },
  conditionals,
}
export default weapon