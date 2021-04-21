import DisplayPercent from "../../../Components/DisplayPercent"
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_The_Black_Sword.png'

const refinementVals = [20, 25, 30, 35, 40]
const refinementRegenVals = [60, 70, 80, 90, 100]
const weapon : WeaponSheet = {
  name: "The Black Sword",
  weaponType: "sword",
  img,
  rarity: 4,
  passiveName: "Justice",
  passiveDescription: stats => <span>Increases DMG dealt by Normal and Charged Attacks by {refinementVals[stats.weapon.refineIndex]}%. Additionally, regenerates {refinementRegenVals[stats.weapon.refineIndex]}% of ATK{DisplayPercent(refinementRegenVals[stats.weapon.refineIndex], stats, "finalATK")} as HP when Normal and Charged Attacks score a CRIT Hit. This effect can occur once every 5s.</span>,
  description: "A pitch-black longsword that thirsts for violence and conflict. It is said that this weapon can cause its user to become drunk on the red wine of slaughter.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "critRate_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  stats: stats => ({
    normal_dmg_: refinementVals[stats.weapon.refineIndex],
    charged_dmg_: refinementVals[stats.weapon.refineIndex]
  })
}
export default weapon