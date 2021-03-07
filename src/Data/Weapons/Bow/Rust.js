import Rust from './Weapon_Rust.png'
const refinementVals = [40, 50, 60, 70, 80]
const weapon = {
  name: "Rust",
  weaponType: "bow",
  img: Rust,
  rarity: 4,
  passiveName: "Rapid Firing",
  passiveDescription: (refineIndex) => `Increases Normal Attack DMG by ${refinementVals[refineIndex]}% but decreases Charged Attack DMG by 10%.`,
  description: "A completely rusted iron greatbow. The average person would lack the strength to even lift it, let alone fire it.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  stats: (refineIndex) => ({
    normal_dmg_: refinementVals[refineIndex],
    charged_dmg_: -10
  })
}
export default weapon