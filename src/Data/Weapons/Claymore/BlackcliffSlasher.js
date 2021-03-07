import BlackcliffSlasher from './Weapon_Blackcliff_Slasher.png'
const refinementVals = [12, 15, 18, 21, 24]
const weapon = {
  name: "Blackcliff Slasher",
  weaponType: "claymore",
  img: BlackcliffSlasher,
  rarity: 4,
  passiveName: "Press the Advantage",
  passiveDescription: (refineIndex) => `After defeating an opponent, ATK is increased by ${refinementVals[refineIndex]}% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others.`,
  description: "An extremely sturdy greatsword from the Blackcliff Forge. It has a dark crimson color from the blade to pommel.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "critDMG_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
  conditional: {
    type: "weapon",
    sourceKey: "BlackcliffSlasher",
    maxStack: 3,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex]
    })
  }
}
export default weapon