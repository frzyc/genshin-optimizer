import WolfsGravestone from './Weapon_Wolf\'s_Gravestone.png'
const refinementVals = [20, 25, 30, 35, 40]
const refinementPartyAtkVal = [40, 50, 60, 70, 80]
const weapon = {
  name: "Wolf’s Gravestone",
  weaponType: "claymore",
  img: WolfsGravestone,
  rarity: 5,
  passiveName: "Wolfish Tracker",
  passiveDescription: (refineIndex) => `Increases ATK by ${refinementVals[refineIndex]}%. On hit, attacks against opponents with less than 30% HP increase all party members' ATK by ${refinementPartyAtkVal[refineIndex]}% for 12s. Can only occur once every 30s.`,
  description: "A longsword used by the Wolf Knight. Originally just a heavy sheet of iron given to the knight by a blacksmith from the city, it became endowed with legendary power owing to his friendship with the wolves.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    subStatKey: "atk_",
    sub: [10.8, 12.5, 14.7, 16.9, 19.1, 19.1, 21.3, 23.4, 25.6, 27.8, 27.8, 30, 32.2, 32.2, 34.4, 36.5, 36.5, 38.7, 40.9, 40.9, 43.1, 45.3, 45.3, 47.4, 49.6],
  },
  stats: (refineIndex) => ({
    atk_: refinementVals[refineIndex]
  }),
  conditional: {
    type: "weapon",
    sourceKey: "WolfsGravestone",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementPartyAtkVal[refineIndex]
    })
  }
}
export default weapon