import FesteringDesire from './Weapon_Festering_Desire.png'
const refinementVals = [16, 20, 24, 28, 32]
const refinementVals2 = [6, 7.5, 9, 10.5, 12]
const weapon = {
  name: "Festering Desire",
  weaponType: "sword",
  img: FesteringDesire,
  rarity: 4,
  passiveName: "Undying Admiration",
  passiveDescription: (refineIndex) => `Increases Elemental Skill DMG by ${refinementVals[refineIndex]}% and Elemental Skill CRIT Rate by ${refinementVals2[refineIndex]}%.`,
  description: "A creepy straight sword that almost seems to yearn for life. It drips with a shriveling venom that could even corrupt a mighty dragon.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "enerRech_",
    sub: [10, 11.6, 13.6, 15.7, 17.7, 17.7, 19.7, 21.7, 23.7, 25.8, 25.8, 27.8, 29.8, 29.8, 31.8, 33.8, 33.8, 35.9, 37.9, 37.9, 39.9, 41.9, 41.9, 43.9, 45.9],
  },
  stats: (refineIndex) => ({
    skill_dmg_: refinementVals[refineIndex],
    skill_critRate_: refinementVals2[refineIndex]
  })
}
export default weapon