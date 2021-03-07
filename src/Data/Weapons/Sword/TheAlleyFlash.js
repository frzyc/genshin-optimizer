import TheAlleyFlash from './Weapon_The_Alley_Flash.png'
const weapon = {
  name: "The Alley Flash",
  weaponType: "sword",
  img: TheAlleyFlash,
  rarity: 4,
  passiveName: "Itinerant Hero",
  passiveDescription: () => `Continuosly sprinting for at least 1s increases ATK by 28% for 6s. This effect cannot stack.`,
  description: "A straight sword as black as the night. It once belonged to a thief who roamed the benighted streets.",
  baseStats: {
    main: [44, NaN, NaN, NaN, 119, 144, NaN, NaN, NaN, 226, 252, NaN, 293, 319, NaN, 361, 387, NaN, 429, 455, NaN, 497, 523, NaN, 565],//TODO find values
    subStatKey: "critRate_",
    sub: [4, NaN, NaN, NaN, 7.1, 7.1, NaN, NaN, NaN, 10.3, 10.3, NaN, 11.9, 11.9, NaN, 13.6, 13.6, NaN, 15.2, 15.2, NaN, 16.8, 16.8, NaN, NaN],
  },
  conditional: {
    type: "weapon",
    sourceKey: "TheAlleyFlash",
    maxStack: 1,
    stats: () => ({
      atk_: 28
    })
  }
}
export default weapon