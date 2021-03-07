import BlackcliffLongsword from './Weapon_Blackcliff_Longsword.png'
const refinementVals = [12, 15, 18, 21, 24]
const weapon = {
  name: "Blackcliff Longsword",
  weaponType: "sword",
  img: BlackcliffLongsword,
  rarity: 4,
  passiveName: "Press the Advantage",
  passiveDescription: (refineIndex) => `After defeating an opponent, ATK is increased by ${refinementVals[refineIndex]}% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others.`,
  description: "A sword made of a material known as \"blackcliff.\" It has a dark crimson glow on its black blade.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "critDMG_",
    sub: [8, 9.3, 10.9, 12.5, 14.1, 14.1, 15.8, 17.4, 19, 20.6, 20.6, 22.2, 23.8, 23.8, 25.4, 27.1, 27.1, 28.7, 30.3, 30.3, 31.9, 33.5, 33.5, 35.1, 36.8],
  },
  conditional: {
    type: "weapon",
    sourceKey: "BlackcliffLongsword",
    maxStack: 3,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex]
    })
  }
}
export default weapon