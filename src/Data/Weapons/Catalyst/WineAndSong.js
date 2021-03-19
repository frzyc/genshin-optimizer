import WineAndSong from './Weapon_Wine_and_Song.png'
const refinementSprintVals = [14, 16, 18, 20, 22]
const refinementATKVals = [20, 25, 30, 35, 40]
const weapon = {
  name: "Wine and Song",
  weaponType: "catalyst",
  img: WineAndSong,
  rarity: 4,
  passiveName: "Wind in the Square",
  passiveDescription: (refineIndex) => `Hitting an opponent with a Normal Attack decreases the Stamina consumption of Sprint or Alternate sprint by ${refinementSprintVals[refineIndex]}% for 5s. Additionally, using a Sprint or Alternate Sprint ability increases ATK by ${refinementATKVals[refineIndex]}% for 5s.`,
  description: "A songbook from the bygone aristocratic era, whose composer has become forgotten. It chronicles the tale of a certain heroic outlaw.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "enerRech_",
    sub: [6.7, 7.7, 9.1, 10.4, 11.8, 11.8, 13.1, 14.5, 15.8, 17.2, 17.2, 18.5, 19.9, 19.9, 21.2, 22.6, 22.6, 23.9, 25.2, 25.2, 26.6, 27.9, 27.9, 29.3, 30.6],
  },
  conditional: {
    type: "weapon",
    sourceKey: "WineAndSong",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementATKVals[refineIndex],//TODO: stamine decrease for sprint
    })
  }
}
export default weapon