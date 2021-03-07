import SkywardHarp from './Weapon_Skyward_Harp.png'
import Character from "../../../Character/Character"
import DisplayPercent from "../../../Components/DisplayPercent"

const refinementVals = [20, 25, 30, 35, 40]
const refinementChangeVals = [60, 70, 80, 90, 100]
const weapon = {
  name: "Skyward Harp",
  weaponType: "bow",
  img: SkywardHarp,
  rarity: 5,
  passiveName: "Echoing Ballad",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Increases CRIT DMG by {refinementVals[refineIndex]}%. Hits have a {refinementChangeVals[refineIndex]}% chance to inflict a small AoE attack, dealing 125% <span className="text-physical">Physical ATK DMG</span>{DisplayPercent(125, charFinalStats, Character.getTalentStatKey("phy", c))}. Can only occur once every 4s.</span>,//$
  description: "A greatbow that symbolizes Dvalin's affiliation with the Anemo Archon. The sound of the bow firing is music to the Anemo Archon's ears. It contains the power of the sky and wind within.",
  baseStats: {
    main: [48, 65, 87, 110, 133, 164, 188, 212, 236, 261, 292, 316, 341, 373, 398, 423, 455, 480, 506, 537, 563, 590, 621, 648, 674],
    subStatKey: "critRate_",
    sub: [4.8, 5.6, 6.5, 7.5, 8.5, 8.5, 9.5, 10.4, 11.4, 12.4, 12.4, 13.3, 14.3, 14.3, 15.3, 16.2, 16.2, 17.2, 18.2, 18.2, 19.1, 20.1, 20.1, 21.1, 22.1],
  },
  stats: (refineIndex) => ({
    critDMG_: refinementVals[refineIndex]
  })
}
export default weapon