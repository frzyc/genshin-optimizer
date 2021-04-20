import img from './Weapon_Apprentice\'s_Notes.png'

const weapon = {
  name: "Apprentice’s Notes",
  weaponType: "catalyst",
  img,
  rarity: 1,
  passiveName: "",
  passiveDescription: () => ``,
  description: "Notes left behind by a top student. Many useful spells are listed, and the handwriting is beautiful.",
  baseStats: {
    main: [23, 30, 39, 48, 56, 68, 76, 85, 93, 102, 113, 121, 130, 141, 149, 158, 169, 177, 185],
    subStatKey: "",
  }
}
export default weapon