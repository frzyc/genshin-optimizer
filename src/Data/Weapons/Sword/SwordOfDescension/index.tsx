import { getTalentStatKey } from '../../../../Build/Build'
import DisplayPercent from "../../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Sword_of_Descension.png'

const weapon: IWeaponSheet = {
  name: "Sword of Descension",
  weaponType: "sword",
  img,
  rarity: 4,
  passiveName: "Descension",
  passiveDescription: stats => <span>Hitting opponents with Normal and Charged Attacks grants a 50% chance to deal 200% ATK as DMG{DisplayPercent(200, stats, getTalentStatKey("physical", stats))} in a small AoE. This effect can only occur once every 10s. Additionally, if the Traveler equips the Sword of Descension, their ATK is increased by 66.</span>,
  description: "This sharp polearm can seemingly pierce through anything. When swung, one can almost see the rift it tears in the air.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 120, 134, 148, 162, 176, 202, 215, 229, 255, 269, 282, 308, 322, 335, 361, 374, 388, 414, 427, 440],
    substatKey: "atk_",
    sub: [7.7, 8.9, 10.4, 12, 13.5, 13.5, 15.1, 16.6, 18.2, 19.7, 19.7, 21.3, 22.8, 22.8, 24.4, 25.9, 25.9, 27.5, 29, 29, 30.5, 32.1, 32.1, 33.6, 35.2],
  },
  stats: stats => stats.characterKey.startsWith("traveler") && {
    atk: 66
  },
}
export default weapon