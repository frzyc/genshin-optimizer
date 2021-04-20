import img from './Weapon_Pocket_Grimoire.png'

const weapon = {
  name: "Pocket Grimoire",
  weaponType: "catalyst",
  img,
  rarity: 2,
  passiveName: "",
  passiveDescription: () => ``,
  description: "A carefully compiled notebook featuring the essentials needed to pass a magic exam.",
  baseStats: {
    main: [33, 43, 55, 68, 80, 91, 103, 115, 127, 139, 151, 162, 174, 186, 197, 209, 220, 232, 243],
    subStatKey: "",
  },
}
export default weapon