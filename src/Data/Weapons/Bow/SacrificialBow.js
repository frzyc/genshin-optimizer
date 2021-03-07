import SacrificialBow from './Weapon_Sacrificial_Bow.png'
const refinementVals = [40, 50, 60, 70, 80]
const refinementCdVals = [30, 26, 22, 19, 16]
const weapon = {
  name: "Sacrificial Bow",
  weaponType: "bow",
  img: SacrificialBow,
  rarity: 4,
  passiveName: "Composed",
  passiveDescription: (refineIndex) => `After dealing damage to an enemy with an Elemental Skill, the skill has a ${refinementVals[refineIndex]}% chance to end its own CD. Can only occur once every ${refinementCdVals[refineIndex]}s.`,
  description: "A ceremonial hunting bow that has become petrified over time. The trinkets on it are still visible. It grants the wielder the power to withstand the winds of time.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "enerRech_",
    sub: [6.7, 7.7, 9.1, 10.4, 11.8, 11.8, 13.1, 14.5, 15.8, 17.2, 17.2, 18.5, 19.9, 19.9, 21.2, 22.6, 22.6, 23.9, 25.2, 25.2, 26.6, 27.9, 27.9, 29.3, 30.6],
  },
  conditional: {
    type: "weapon",
    sourceKey: "SacrificialBow",
    maxStack: 1,
    stats: () => ({
      cdRed_: 100
    })
  }
}
export default weapon