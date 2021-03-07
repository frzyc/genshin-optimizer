import SerpentSpine from './Weapon_Serpent_Spine.png'
const refinementVals = [6, 7, 8, 9, 10]
const refinementTakeDmgVals = [3, 2.7, 2.4, 2.2, 2]
const weapon = {
  name: "Serpent Spine",
  weaponType: "claymore",
  img: SerpentSpine,
  rarity: 4,
  passiveName: "Wavesplitter",
  passiveDescription: (refineIndex) => `Every 4s a character is on the field, they will deal ${refinementVals[refineIndex]}% more DMG and take ${refinementTakeDmgVals[refineIndex]}% more DMG. This effect has a maximum of 5 stacks and will not be reset if the character leaves the field, but will be reduced by 1 stack when the character takes DMG.`,
  description: "A rare weapon whose origin is the ancient ocean. One can hear the sound of the ageless waves as one swings it.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "critRate_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  conditional: {
    type: "weapon",
    sourceKey: "SerpentSpine",
    maxStack: 5,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon