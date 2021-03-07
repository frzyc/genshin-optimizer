import SharpshootersOath from './Weapon_Sharpshooter\'s_Oath.png'
const refinementVals = [24, 30, 36, 42, 48]
const weapon = {
  name: "Sharpshooter’s Oath",
  weaponType: "bow",
  img: SharpshootersOath,
  rarity: 3,
  passiveName: "Precise",
  passiveDescription: (refineIndex) => `Increases DMG against weak spots by ${refinementVals[refineIndex]}%.`,
  description: "This superior bow once belonged to a master archer. However, it gives off a strong scent, thus making it unsuitable for hunting.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "critDMG_",
    sub: [10.2, 11.9, 13.9, 16, 18, 18, 20.1, 22.1, 24.2, 26.3, 26.3, 28.3, 30.4, 30.4, 32.4, 34.5, 34.5, 36.6, 38.6, 38.6, 40.7, 42.7, 42.7, 44.8, 46.9],
  },
  stats: (refineIndex) => ({
    weakspotDMG_: refinementVals[refineIndex]
  })
}
export default weapon