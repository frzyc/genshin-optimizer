import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_The_Viridescent_Hunt.png'

const refinementVals = [40, 50, 60, 70, 80]
const refinementCdVals = [14, 13, 12, 11, 10]
const weapon: IWeaponSheet = {
  name: "The Viridescent Hunt",
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: "Verdant Wind",
  passiveDescription: stats => <span>Upon hit, Normal and Aimed Shot Attacks have a 50% chance to generate a Cyclone, which will continuously attract surrounding enemies, dealing {refinementVals[stats.weapon.refineIndex]}% of ATK{DisplayPercent(refinementVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))} as DMG to these enemies every 0.5s for 4s. This effect can only occur once every {refinementCdVals[stats.weapon.refineIndex]}s.</span>,//$
  description: "A pure green hunting bow. This once belonged to a certain hunter whose home was the forest.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "critRate_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  }
}
export default weapon