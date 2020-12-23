const refinementVals = [20,25,30,35,40]
const weapon = {
  name: "Quartz",
  weaponType: "claymore",
  rarity: 3,
  passiveName: "Residual Heat",
  passiveDescription: (refineIndex) => `Upon causing an Overloaded, Melt, Burning, Vaporize, or a Pyro-infused Swirl reaction, ATK is increased by ${refinementVals[refineIndex]}% for 12s.`,
  description: "A simple but heavy greatsword made of polished black Quartz with a golden gilt. It has an air of elegance and dignity about it.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "ele_mas",
    sub: [31, 36, 42, 48, 54, 54, 60, 66, 73, 79, 79, 85, 91, 91, 97, 104, 104, 110, 116, 116, 122, 128, 128, 134, 141],
  },
  conditional: {
    type: "weapon",
    sourceKey: "Quartz",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex]
    })
  }
}
export default weapon