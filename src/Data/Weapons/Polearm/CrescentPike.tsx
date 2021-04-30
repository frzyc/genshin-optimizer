import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Crescent_Pike.png'

const refinementVals = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  name: "Crescent Pike",
  weaponType: "polearm",
  img,
  rarity: 4,
  passiveName: "Infusion Needle",
  passiveDescription: stats => <span>After picking up an Elemental Orb/Particle, Normal and Charged Attacks deal an additional {refinementVals[stats.weapon.refineIndex]}% ATK DMG{DisplayPercent(refinementVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))} for 5s.</span>,
  description: "An exotic weapon with an extremely long blade on the top and a crescent blade at the bottom. It found its way into Liyue through foreign traders. With practice, it can deal heavy damage.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    substatKey: "physical_dmg_",
    sub: [7.5, 8.7, 10.2, 11.7, 13.3, 13.3, 14.8, 16.3, 17.8, 19.3, 19.3, 20.8, 22.4, 22.4, 23.9, 25.4, 25.4, 26.9, 28.4, 28.4, 29.9, 31.5, 31.5, 33, 34.5],
  },
}
export default weapon