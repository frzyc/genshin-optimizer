import TheStringless from './Weapon_The_Stringless.png'
const refinementVals = [24, 30, 36, 42, 48]
const weapon = {
  name: "The Stringless",
  weaponType: "bow",
  img: TheStringless,
  rarity: 4,
  passiveName: "Arrowless Song",
  passiveDescription: (refineIndex) => `Increases Elemental Skill and Elemental Burst DMG by ${refinementVals[refineIndex]}%.`,
  description: "A bow that once served as an extraordinary instrument. It is no longer capable of getting people up and dancing.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "eleMas",
    sub: [36, 42, 49, 56, 64, 64, 71, 78, 85, 93, 93, 100, 107, 107, 115, 122, 122, 129, 136, 136, 144, 151, 151, 158, 165],
  },
  stats: (refineIndex) => ({
    skill_dmg_: refinementVals[refineIndex],
    burst_dmg_: refinementVals[refineIndex]
  })
}
export default weapon