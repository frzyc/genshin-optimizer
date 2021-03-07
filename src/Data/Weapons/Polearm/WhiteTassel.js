import WhiteTassel from './Weapon_White_Tassel.png'
const refinementVals = [24, 30, 36, 42, 48]
const weapon = {
  name: "White Tassel",
  weaponType: "polearm",
  img: WhiteTassel,
  rarity: 3,
  passiveName: "Sharp",
  passiveDescription: (refineIndex) => `Increases Normal Attack DMG by ${refinementVals[refineIndex]}%.`,
  description: "A standard-issue weapon of the Millelith soldiers. It has a sturdy shaft and sharp spearhead. It's a reliable weapon.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "critRate_",
    sub: [5.1, 5.9, 7, 8, 9, 9, 10, 11.1, 12.1, 13.1, 13.1, 14.2, 15.2, 15.2, 16.2, 17.3, 17.3, 18.3, 19.3, 19.3, 20.3, 21.4, 21.4, 22.4, 23.4],
  },
  stats: (refineIndex) => ({
    normal_dmg_: refinementVals[refineIndex]
  })
}
export default weapon