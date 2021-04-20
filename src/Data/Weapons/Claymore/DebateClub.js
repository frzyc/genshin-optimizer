import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import img from './Weapon_Debate_Club.png'

const refinementVals = [60, 75, 90, 105, 120]
const weapon = {
  name: "Debate Club",
  weaponType: "claymore",
  img,
  rarity: 3,
  passiveName: "Blunt Conclusion",
  passiveDescription: (refineIndex, charFinalStats) => <span>After using an Elemental Skill, Normal or Charged Attacks, on hit, deal an additional {refinementVals[refineIndex]}% ATK DMG{DisplayPercent(refinementVals[refineIndex], charFinalStats, getTalentStatKey("physical", charFinalStats))} in a small area. Effect lasts 15s. DMG can only occur once every 3s.</span>,
  description: "A handy club made of fine steel. The most persuasive line of reasoning in any debater's arsenal.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "atk_",
    sub: [7.7, 8.9, 10.4, 12, 13.5, 13.5, 15.1, 16.6, 18.2, 19.7, 19.7, 21.3, 22.8, 22.8, 24.4, 25.9, 25.9, 27.5, 29, 29, 30.5, 32.1, 32.1, 33.6, 35.2],
  }
}
export default weapon