import EbonyBow from './Weapon_Ebony_Bow.png'
const refinementVals = [40, 50, 60, 70, 80]
const weapon = {
  name: "Ebony Bow",
  weaponType: "bow",
  img: EbonyBow,
  rarity: 3,
  passiveName: "Decimate",
  passiveDescription: (refineIndex) => `Increases DMG against mechanoid Ruin opponents by ${refinementVals[refineIndex]}%.`,
  description: "A longbow made of ebony wood with stiffer limbs than ordinary bows. It is also a far more powerful weapon.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "atk_",
    sub: [7.7, 8.9, 10.4, 12, 13.5, 13.5, 15.1, 16.6, 18.2, 19.7, 19.7, 21.3, 22.8, 22.8, 24.4, 25.9, 25.9, 27.5, 29, 29, 30.5, 32.1, 32.1, 33.6, 35.2],
  },
  conditional: {
    type: "weapon",
    sourceKey: "EbonyBow",
    maxStack: 1,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon