import Rainslasher from './Weapon_Rainslasher.png'
const refinementVals = [20, 24, 28, 32, 36]
const weapon = {
  name: "Rainslasher",
  weaponType: "claymore",
  img: Rainslasher,
  rarity: 4,
  passiveName: "Bane of Storm and Tide",
  passiveDescription: (refineIndex) => `Increases DMG against opponents affected by Hydro or Electro by ${refinementVals[refineIndex]}%.`,
  description: "A fluorescent greatsword with no sharp edge that crushes enemies with brute force and raw power.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "eleMas",
    sub: [36, 42, 49, 56, 64, 64, 71, 78, 85, 93, 93, 100, 107, 107, 115, 122, 122, 129, 136, 136, 144, 151, 151, 158, 165],
  },
  conditional: {
    type: "weapon",
    sourceKey: "Rainslasher",
    maxStack: 1,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon