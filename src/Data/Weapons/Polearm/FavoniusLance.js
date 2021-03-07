import FavoniusLance from './Weapon_Favonius_Lance.png'
const refinementVals = [60, 70, 80, 90, 100]
const refinementCdVals = [12, 10.5, 9, 7.5, 6]
const weapon = {
  name: "Favonius Lance",
  weaponType: "polearm",
  img: FavoniusLance,
  rarity: 4,
  passiveName: "Windfall",
  passiveDescription: (refineIndex) => `CRIT Hits have a ${refinementVals[refineIndex]}% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character. Can only occur once every ${refinementCdVals[refineIndex]}s.`,
  description: "A polearm made in the style of the Knights of Favonius. Its shaft is straight, and its tip flows lightly like the wind.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "enerRech_",
    sub: [6.7, 7.7, 9.1, 10.4, 11.8, 11.8, 13.1, 14.5, 15.8, 17.2, 17.2, 18.5, 19.9, 19.9, 21.2, 22.6, 22.6, 23.9, 25.2, 25.2, 26.6, 27.9, 27.9, 29.3, 30.6],
  }
}
export default weapon