import IronPoint from './Weapon_Iron_Point.png'
const weapon = {
  name: "Iron Point",
  weaponType: "polearm",
  img: IronPoint,
  rarity: 2,
  passiveName: "",
  passiveDescription: () => ``,
  description: "Sharp and pointy at one end, it is a balanced weapon that is quite popular among travelers.",
  baseStats: {
    main: [33, 43, 55, 68, 80, 91, 103, 115, 127, 139, 151, 162, 174, 186, 197, 209, 220, 232, 243],
    subStatKey: ""
  }
}
export default weapon