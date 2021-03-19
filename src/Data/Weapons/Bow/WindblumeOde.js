import img from './Weapon_Windblume_Ode.png'
const refinementVals = [16, 20, 24, 28, 32]
const weapon = {
  name: "Windblume Ode",
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: "Windblume Wish",
  passiveDescription: (refineIndex) => `After using an Elemental Skill, receive a boon from the ancient wish of the Windblume, increasing ATK by ${refinementVals[refineIndex]}% for 6s.`,//${refinementVals[refineIndex]}
  description: "A bow adorned with nameless flowers that bears the earnest hopes of an equally nameless person.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "eleMas",
    sub: [36, 42, 49, 56, 64, 64, 71, 78, 85, 93, 93, 100, 107, 107, 115, 122, 122, 129, 136, 136, 144, 151, 151, 158, 165],
  },
  conditional: {
    type: "weapon",
    sourceKey: "WindblumeOde",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex]
    })
  }
}
export default weapon