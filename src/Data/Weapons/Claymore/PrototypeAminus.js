import WeaponPercent from "../../../Components/WeaponPercent"

const refinementVals = [240, 300, 360, 420, 480]
const weapon = {
  name: "Prototype Aminus",
  weaponType: "claymore",
  rarity: 4,
  passiveName: "Crush",
  passiveDescription: (refineIndex, charFinalStats) => <span>On hit, Normal or Charged Attacks have a 50% chance to deal an additional {refinementVals[refineIndex]}% ATK DMG{WeaponPercent(refinementVals[refineIndex], charFinalStats.atk)} to opponents within a small AoE. Can only occur once every 15s.</span>,
  description: "An ancient greatsword discovered in the Blackcliff Forge. It swings with such an immense force that one feels it could cut straight through reality itself.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "atk_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  }
}
export default weapon