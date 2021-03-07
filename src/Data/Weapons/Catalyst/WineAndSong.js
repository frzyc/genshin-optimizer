import WineAndSong from './Weapon_Wine_and_Song.png'
const refinementAtkVals = [8, 10, 12, 14, 16]
const refinementMoveVals = [3, 3.5, 4, 4.5, 5]
const weapon = {
  name: "Wine and Song",
  weaponType: "catalyst",
  img: WineAndSong,
  rarity: 4,
  passiveName: "Wind in the Square",
  passiveDescription: (refineIndex) => `For every character in the party who hails from Mondstadt, the character who equips this weapon gains ${refinementAtkVals[refineIndex]}% ATK increase and ${refinementMoveVals[refineIndex]}% Movement SPD increase.`,
  description: "A songbook from the bygone aristocratic era, whose composer has become forgotten. It chronicles the tale of a certain heroic outlaw.",
  baseStats: {
    main: [42, NaN, NaN, NaN, 109, 135, NaN, NaN, NaN, 205, 231, NaN, 266, 292, NaN, 327, 353, NaN, 388, 414, NaN, 449, 475, NaN, 510],
    subStatKey: "enerRech_",
    sub: [10, NaN, NaN, NaN, 17.7, 17.7, NaN, NaN, NaN, 25.8, 25.8, NaN, 29.8, 29.8, NaN, 33.8, 33.8, NaN, 40.9, 40.9, NaN, 41.9, 41.9, NaN, 45.9],
  },
  conditional: {
    type: "weapon",
    sourceKey: "WineAndSong",
    maxStack: 4,
    stats: (refineIndex) => ({
      atk_: refinementAtkVals[refineIndex],
      moveSPD_: refinementMoveVals[refineIndex],
    })
  }
}
export default weapon