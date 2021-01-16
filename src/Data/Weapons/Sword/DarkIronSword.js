const refinementVals = [20, 25, 30, 35, 40]
const weapon = {
  name: "Dark Iron Sword",
  weaponType: "sword",
  rarity: 3,
  passiveName: "Elemental Mastery",
  passiveDescription: (refineIndex) => `Upon causing an Overloaded, Superconduct, Electro-Charged, or an Electro-infused Swirl reaction, ATK is increased by ${refinementVals[refineIndex]}% for 12s`,
  description: "A perfectly ordinary iron sword, just slightly darker than most.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "ele_mas",
    sub: [31, 36, 42, 48, 54, 54, 60, 66, 73, 79, 79, 85, 91, 91, 97, 104, 104, 110, 116, 116, 122, 128, 128, 134, 141],
  },
  conditional: {
    type: "weapon",
    sourceKey: "DarkIronSword",
    maxStack: 1,
    stats: (refineIndex) => ({
      all_dmg_bonus: refinementVals[refineIndex]
    })
  }
}
export default weapon