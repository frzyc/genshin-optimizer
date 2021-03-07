import FavoniusCodex from './Weapon_Favonius_Codex.png'
const refinementVals = [60, 70, 80, 90, 100]
const refinementCdVals = [12, 10.5, 9, 7.5, 6]
const weapon = {
  name: "Favonius Codex",
  weaponType: "catalyst",
  img: FavoniusCodex,
  rarity: 4,
  passiveName: "Critical Charge",
  passiveDescription: (refineIndex) => `CRIT hits have a ${refinementVals[refineIndex]}% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character. Can only occur once every ${refinementCdVals[refineIndex]}s.`,
  description: "A secret tome that belonged to the scholars of the Knights of Favonius. It describes the logic and power of elements and matter.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "enerRech_",
    sub: [10, 11.6, 13.6, 15.7, 17.7, 17.7, 19.7, 21.7, 23.7, 25.8, 25.8, 27.8, 29.8, 29.8, 31.8, 33.8, 33.8, 35.9, 37.9, 37.9, 39.9, 41.9, 41.9, 43.9, 45.9],
  },
}
export default weapon