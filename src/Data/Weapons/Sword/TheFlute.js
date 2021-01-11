import Character from "../../../Character/Character"
import DisplayPercent from "../../../Components/DisplayPercent"

const refinementVals = [12, 15, 18, 21, 24]
const weapon = {
  name: "The Flute",
  weaponType: "sword",
  rarity: 4,
  passiveName: "Chord",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Normal or Charged Attacks grant a Harmonic on hits. Gaining 5 Harmonics triggers the power of music and deals {refinementVals[refineIndex]}% ATK DMG{DisplayPercent(refinementVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))} to surrounding opponents. Harmonics last up to 30s, and a maximum of 1 can be gained every 0.5s.</span>,
  description: "Beneath its rusty exterior is a lavishly decorated thin blade. It swings as swiftly as the wind.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  }
}
export default weapon