import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Skyward_Harp.png'

const refinementVals = [20, 25, 30, 35, 40]
const refinementChangeVals = [60, 70, 80, 90, 100]
const refinementCD = [4, 3.5, 3, 2.5, 2]
const weapon: IWeaponSheet = {
  name: "Skyward Harp",
  weaponType: "bow",
  img,
  rarity: 5,
  passiveName: "Echoing Ballad",
  passiveDescription: stats => <span>Increases CRIT DMG by {refinementVals[stats.weapon.refineIndex]}%. Hits have a {refinementChangeVals[stats.weapon.refineIndex]}% chance to inflict a small AoE attack, dealing 125% <span className="text-physical">Physical ATK DMG</span>{DisplayPercent(125, stats, getTalentStatKey("physical", stats))}. Can only occur once every {refinementCD[stats.weapon.refineIndex]}s.</span>,//$
  description: "A greatbow that symbolizes Dvalin's affiliation with the Anemo Archon. The sound of the bow firing is music to the Anemo Archon's ears. It contains the power of the sky and wind within.",
  baseStats: {
    main: [48, 65, 87, 110, 133, 164, 188, 212, 236, 261, 292, 316, 341, 373, 398, 423, 455, 480, 506, 537, 563, 590, 621, 648, 674],
    substatKey: "critRate_",
    sub: [4.8, 5.6, 6.5, 7.5, 8.5, 8.5, 9.5, 10.4, 11.4, 12.4, 12.4, 13.3, 14.3, 14.3, 15.3, 16.2, 16.2, 17.2, 18.2, 18.2, 19.1, 20.1, 20.1, 21.1, 22.1],
  },
  stats: stats => ({
    critDMG_: refinementVals[stats.weapon.refineIndex]
  })
}
export default weapon