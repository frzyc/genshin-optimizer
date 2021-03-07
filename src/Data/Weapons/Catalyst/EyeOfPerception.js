import Character from "../../../Character/Character"
import DisplayPercent from "../../../Components/DisplayPercent"
import EyeOfPerception from './Weapon_Eye_of_Perception.png'
const refinementVals = [240, 270, 300, 330, 360]
const refinementCdVals = [12, 11, 10, 9, 8]
const weapon = {
  name: "Eye of Perception",
  weaponType: "catalyst",
  img: EyeOfPerception,
  rarity: 4,
  passiveName: "Echo",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Normal and Charged Attacks have a 50% chance to fire a Bolt of Perception, dealing {refinementVals[refineIndex]}% ATK{DisplayPercent(refinementVals[refineIndex], charFinalStats, Character.getTalentStatKey("physical", c))} as DMG. This bolt can bounce between opponents a maximum of 4 times. This effect can occur once every {refinementCdVals[refineIndex]}s.</span>,
  description: "A dim black glaze pearl that is said to have the power to read the purity of one's heart.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    subStatKey: "atk_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
}
export default weapon