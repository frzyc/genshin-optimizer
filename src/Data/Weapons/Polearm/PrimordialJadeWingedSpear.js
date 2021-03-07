import PrimordialJadeWingedSpear from './Weapon_Primordial_Jade_Winged-Spear.png'
const refinementVals = [3.2, 3.9, 4.6, 5.3, 6]
const refinementDmgVals = [12, 15, 18, 21, 24]
const weapon = {
  name: "Primordial Jade Winged-Spear",
  weaponType: "polearm",
  img: PrimordialJadeWingedSpear,
  rarity: 5,
  passiveName: "Eagle Spear of Justice",
  passiveDescription: (refineIndex) => `On hit, increases ATK by ${refinementVals[refineIndex]}% for 6s. Max 7 stacks. This effect can only occur once every 0.3s. While in possession of the maximum possible stacks, DMG dealt is increased by ${refinementDmgVals[refineIndex]}%.`,
  description: "A jade polearm made by the archons, capable of slaying ancient beasts.",
  baseStats: {
    main: [48, 65, 87, 110, 133, 164, 188, 212, 236, 261, 292, 316, 341, 373, 398, 423, 455, 480, 506, 537, 563, 590, 621, 648, 674],
    subStatKey: "critRate_",
    sub: [4.8, 5.6, 6.5, 7.5, 8.5, 8.5, 9.5, 10.4, 11.4, 12.4, 12.4, 13.3, 14.3, 14.3, 15.3, 16.2, 16.2, 17.2, 18.2, 18.2, 19.1, 20.1, 20.1, 21.1, 22.1],
  },
  conditional: [{
    type: "weapon",
    condition: "Less than 7 stacks",
    sourceKey: "PrimordialJadeWingedSpear",
    maxStack: 6,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex]
    })
  }, {
    type: "weapon",
    condition: "At 7 stacks",
    sourceKey: "PrimordialJadeWingedSpear",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex] * 7,
      dmg_: refinementDmgVals[refineIndex]
    })
  }]
}
export default weapon