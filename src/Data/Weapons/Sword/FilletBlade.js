import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import img from './Weapon_Fillet_Blade.png'

const refinementVals = [240, 280, 320, 360, 400]
const refinementcdVals = [15, 14, 13, 12, 11]
const weapon = {
  name: "Fillet Blade",
  weaponType: "sword",
  img,
  rarity: 3,
  passiveName: "Gash",
  passiveDescription: (refineIndex, charFinalStats) => <span>On hit, has a 50% chance to deal {refinementVals[refineIndex]}% ATK DMG{DisplayPercent(refinementVals[refineIndex], charFinalStats, getTalentStatKey("physical", charFinalStats))} to a single opponent. Can only occur once every {refinementcdVals[refineIndex]}s.</span>,
  description: "A sharp filleting knife. The blade is long, thin, and incredibly sharp.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "atk_",
    sub: [7.7, 8.9, 10.4, 12, 13.5, 13.5, 15.1, 16.6, 18.2, 19.7, 19.7, 21.3, 22.8, 22.8, 24.4, 25.9, 25.9, 27.5, 29, 29, 30.5, 32.1, 32.1, 33.6, 35.2],
  },
}
export default weapon