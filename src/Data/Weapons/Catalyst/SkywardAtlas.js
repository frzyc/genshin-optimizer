import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import SkywardAtlas from './Weapon_Skyward_Atlas.png'

const refinementVals = [12, 15, 18, 21, 24]
const refinementDmgVals = [160, 200, 240, 280, 320]
const weapon = {
  name: "Skyward Atlas",
  weaponType: "catalyst",
  img: SkywardAtlas,
  rarity: 5,
  passiveName: "Wandering Clouds",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Increases Elemental DMG Bonus by {refinementVals[refineIndex]}%. Normal Attack hits have a 50% chance to earn the favor of the clouds. which actively seek out nearby enemies to attack for 15s, dealing {refinementDmgVals[refineIndex]}% ATK DMG{DisplayPercent(refinementDmgVals[refineIndex], charFinalStats, getTalentStatKey("physical", charFinalStats))}. Can only occur once every 30s.</span>,
  description: "A cloud atlas symbolizing Dvalin and its former master, the Anemo Archon. It details the winds and clouds of the northern regions and contains the powers of the sky and wind.",
  baseStats: {
    main: [48, 65, 87, 110, 133, 164, 188, 212, 236, 261, 292, 316, 341, 373, 398, 423, 455, 480, 506, 537, 563, 590, 621, 648, 674],
    subStatKey: "atk_",
    sub: [7.2, 8.4, 9.8, 11.3, 12.7, 12.7, 14.2, 15.6, 17.1, 18.5, 18.5, 20, 21.4, 21.4, 22.9, 24.4, 24.4, 25.8, 27.3, 27.3, 28.7, 30.2, 30.2, 31.6, 33.1],
  },
  stats: (refineIndex) => ({
    anemo_dmg_: refinementVals[refineIndex],
    geo_dmg_: refinementVals[refineIndex],
    electro_dmg_: refinementVals[refineIndex],
    hydro_dmg_: refinementVals[refineIndex],
    pyro_dmg_: refinementVals[refineIndex],
    cryo_dmg_: refinementVals[refineIndex],
  })
}
export default weapon