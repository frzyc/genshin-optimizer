import img from './Weapon_Silver_Sword.png'

const weapon = {
  name: "Silver Sword",
  weaponType: "sword",
  img,
  rarity: 2,
  passiveName: "",
  passiveDescription: () => "",
  description: "A sword for exorcising demons. Everyone knows it's made of a silver alloy, not pure silver.",
  baseStats: {
    main: [33, 43, 55, 68, 80, 91, 103, 115, 127, 139, 151, 162, 174, 186, 197, 209, 220, 232, 243],
    subStatKey: "",
  },
}
export default weapon