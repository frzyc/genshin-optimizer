import PrototypeRancour from './Weapon_Prototype_Rancour.png'
const refinementVals = [4, 5, 6, 7, 8]
const weapon = {
  name: "Prototype Rancour",
  weaponType: "sword",
  img: PrototypeRancour,
  rarity: 4,
  passiveName: "Smashed Stone",
  passiveDescription: (refineIndex) => `On hit, Normal or Charged Attacks increase ATK and DEF by ${refinementVals[refineIndex]}% for 6s. Max 4 stacks. This effect can only occur once every 0.3s.`,
  description: "An ancient longsword discovered in the Blackcliff Forge that cuts through rocks like a hot knife through butter.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "physical_dmg_",
    sub: [7.5, 8.7, 10.2, 11.7, 13.3, 13.3, 14.8, 16.3, 17.8, 19.3, 19.3, 20.8, 22.4, 22.4, 23.9, 25.4, 25.4, 26.9, 28.4, 28.4, 29.9, 31.5, 31.5, 33, 34.5],
  },
  conditional: {
    type: "weapon",
    sourceKey: "PrototypeRancour",
    maxStack: 4,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex],
      def_: refinementVals[refineIndex]
    })
  }
}
export default weapon