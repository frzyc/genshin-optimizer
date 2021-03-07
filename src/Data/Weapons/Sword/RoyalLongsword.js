import RoyalLongsword from './Weapon_Royal_Longsword.png'
const refinementVals = [8, 10, 12, 14, 16]
const weapon = {
  name: "Royal Longsword",
  weaponType: "sword",
  img: RoyalLongsword,
  rarity: 4,
  passiveName: "Focus",
  passiveDescription: (refineIndex) => `Upon damaging an opponent, increases CRIT Rate by ${refinementVals[refineIndex]}%. Max 5 stacks. A CRIT Hit removes all stacks.`,
  description: "An old longsword that belonged to the erstwhile rulers of Mondstadt. Exquisitely crafted, the carvings and embellishments testify to the stature of its owner.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditional: {
    type: "weapon",
    sourceKey: "RoyalLongsword",
    maxStack: 5,
    stats: (refineIndex) => ({
      critRate_: refinementVals[refineIndex]
    })
  }
}
export default weapon