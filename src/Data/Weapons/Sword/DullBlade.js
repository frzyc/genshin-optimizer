import img from './Weapon_Dull_Blade.png'

const weapon = {
  name: "Dull Blade",
  weaponType: "sword",
  img,
  rarity: 1,
  passiveName: "",
  passiveDescription: () => "",
  description: "Youthful dreams and the thrill of adventure. If this isn't enough, then make it up with valiance.",
  baseStats: {
    main: [23, 30, 39, 48, 56, 68, 76, 85, 93, 102, 113, 121, 130, 141, 149, 158, 169, 177, 185],
    subStatKey: "",
  },
}
export default weapon