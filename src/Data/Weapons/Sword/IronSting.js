import IronSting from './Weapon_Iron_Sting.png'
const refinementVals = [6, 7.5, 9, 10.5, 12]
const weapon = {
  name: "Iron Sting",
  weaponType: "sword",
  img: IronSting,
  rarity: 4,
  passiveName: "Infusion Stinger",
  passiveDescription: (refineIndex) => `Dealing Elemental DMG increases all DMG by ${refinementVals[refineIndex]}% for 6s. Max 2 stacks. Can occur once every 1s.`,
  description: "An exotic long-bladed rapier that somehow found its way into Liyue via foreign traders. It is light, agile, and sharp.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "eleMas",
    sub: [36, 42, 49, 56, 64, 64, 71, 78, 85, 93, 93, 100, 107, 107, 115, 122, 122, 129, 136, 136, 144, 151, 151, 158, 165],
  },
  conditional: {
    type: "weapon",
    sourceKey: "IronSting",
    maxStack: 2,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon