import DreamsOfDragonfell from './dreams_of_dragonfell.png'
const refinementVals = [20, 25, 30, 35, 40]
const refinementAtkVals = [4, 5, 6, 7, 8]
const weapon = {
  name: "Dreams of Dragonfell",
  weaponType: "bow",
  img: DreamsOfDragonfell,
  rarity: 5,
  passiveName: "Golden Majesty",
  passiveDescription: (refineIndex) => `Increases Shield Strength by ${refinementVals[refineIndex]}%. Scoring hits on opponents increases ATK by ${refinementAtkVals[refineIndex]}% for 8s. Max 5 stacks. Can only occur once every 0.3s. While protected by a shield, this ATK increase effect is increased by 100%.`,
  description: "A great bow that once shot clean through a giant dragon. Once released, the impetus of its bowstring resembles a peal of thunder.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    subStatKey: "atk_",
    sub: [10.8, 12.5, 14.7, 16.9, 19.1, 19.1, 21.3, 23.4, 25.6, 27.8, 27.8, 30, 32.2, 32.2, 34.4, 36.5, 36.5, 38.7, 40.9, 40.9, 43.1, 45.3, 45.3, 47.4, 49.6],
  },
  stats: (refineIndex) => ({
    powShield_: refinementVals[refineIndex]
  }),
  conditional: [{
    type: "weapon",
    condition: "Hits without shield",
    sourceKey: "DreamsOfDragonfell",
    maxStack: 5,
    stats: (refineIndex) => ({
      atk_: refinementAtkVals[refineIndex]
    })
  }, {
    type: "weapon",
    condition: "Hits with shield",
    sourceKey: "DreamsOfDragonfell",
    maxStack: 5,
    stats: (refineIndex) => ({
      atk_: 2 * refinementAtkVals[refineIndex]
    })
  }]
}
export default weapon