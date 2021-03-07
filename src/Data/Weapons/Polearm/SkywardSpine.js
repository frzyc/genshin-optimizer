import Character from "../../../Character/Character"
import DisplayPercent from "../../../Components/DisplayPercent"
import SkywardSpine from './Weapon_Skyward_Spine.png'
const refinementCritVals = [8, 10, 12, 14, 16]
const refinementRawDmgVals = [40, 55, 70, 85, 100]
const weapon = {
  name: "Skyward Spine",
  weaponType: "polearm",
  img: SkywardSpine,
  rarity: 5,
  passiveName: "Black Wing",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Increases CRIT Rate by {refinementCritVals[refineIndex]}% and increases Normal ATK SPD by 12%. Additionally, Normal and Charged Attacks hits on opponents have a 50% chance to trigger a vacuum blade that deals {refinementRawDmgVals[refineIndex]}% of ATK{DisplayPercent(refinementRawDmgVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))} as DMG in a small AoE. This effect can occur no more than once every 2s.</span>,
  description: "A polearm that symbolizes Dvalin's firm resolve. The upright shaft of this weapon points towards the heavens, clad in the might of sky and wind.",
  baseStats: {
    main: [48, 65, 87, 110, 133, 164, 188, 212, 236, 261, 292, 316, 341, 373, 398, 423, 455, 480, 506, 537, 563, 590, 621, 648, 674],
    subStatKey: "enerRech_",
    sub: [8, 9.3, 10.9, 12.5, 14.1, 14.1, 15.8, 17.4, 19, 20.6, 20.6, 22.2, 23.8, 23.8, 25.4, 27.1, 27.1, 28.7, 30.3, 30.3, 31.9, 33.5, 33.5, 35.1, 36.8],
  },
  stats: (refineIndex) => ({
    critRate_: refinementCritVals[refineIndex],
    atkSPD_: 12
  }),
}
export default weapon