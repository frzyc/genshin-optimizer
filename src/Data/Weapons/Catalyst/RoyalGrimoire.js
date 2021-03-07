import RoyalGrimoire from './Weapon_Royal_Grimoire.png'
const refinementVals = [8, 10, 12, 14, 16]
const weapon = {
  name: "Royal Grimoire",
  weaponType: "catalyst",
  img: RoyalGrimoire,
  rarity: 4,
  passiveName: "Focus",
  passiveDescription: (refineIndex) => `Upon damaging an opponent, increases CRIT Rate by ${refinementVals[refineIndex]}%. Max 5 stacks. A CRIT hit removes all stacks.`,
  description: "A book that once belonged to a royal mage of Mondstadt. It contains faithful and comprehensive historical accounts as well as magic spells.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "atk_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  conditional: {
    type: "weapon",
    sourceKey: "RoyalGrimoire",
    maxStack: 5,
    stats: (refineIndex) => ({
      critRate_: refinementVals[refineIndex]
    })
  }
}
export default weapon