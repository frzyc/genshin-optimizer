import EmeraldOrb from './Weapon_Emerald_Orb.png'
const refinementVals = [20, 25, 30, 35, 40]
const weapon = {
  name: "Emerald Orb",
  weaponType: "catalyst",
  img: EmeraldOrb,
  rarity: 3,
  passiveName: "Rapids",
  passiveDescription: (refineIndex) => `Upon causing a Vaporize, Electro-Charged, Frozen, or a Hydro-infused Swirl reaction, increases ATK by ${refinementVals[refineIndex]}% for 12s.`,
  description: " catalyst carved out of the hard jade from Jueyunjian north of Liyue. It is small, light, and durable.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    subStatKey: "eleMas",
    sub: [20, 24, 28, 32, 36, 36, 40, 44, 48, 53, 53, 57, 61, 61, 65, 69, 69, 73, 77, 77, 81, 85, 85, 90, 94],
  },
  conditional: {
    type: "weapon",
    sourceKey: "EmeraldOrb",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex]
    })
  }
}
export default weapon