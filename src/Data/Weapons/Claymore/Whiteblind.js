import Whiteblind from './Weapon_Whiteblind.png'
const refinementVals = [6, 7.5, 9, 10.5, 12]
const weapon = {
  name: "Whiteblind",
  weaponType: "claymore",
  img: Whiteblind,
  rarity: 4,
  passiveName: "Infusion Blade",
  passiveDescription: (refineIndex) => `On hit, Normal or Charged Attacks increase ATK and DEF by ${refinementVals[refineIndex]}% for 6s. Max 4 stacks. This effect can only occur once every 0.5s.`,
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "def_",
    sub: [11.3, 13.1, 15.3, 17.6, 19.9, 19.9, 22.2, 24.4, 26.7, 29, 29, 31.3, 33.5, 33.5, 35.8, 38.1, 38.1, 40.4, 42.6, 42.6, 44.9, 47.2, 47.2, 49.5, 51.7],
  },
  conditional: {
    type: "weapon",
    sourceKey: "Whiteblind",
    maxStack: 4,
    stats: (refineIndex) => ({
      def_: refinementVals[refineIndex],
      atk_: refinementVals[refineIndex]
    })
  }
}
export default weapon