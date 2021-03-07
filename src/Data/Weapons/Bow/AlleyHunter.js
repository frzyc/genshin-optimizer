import AlleyHunter from './Weapon_Alley_Hunter.png'
const refinementVals = [4, 5, 6, 7, 8]
const weapon = {
  name: "Alley Hunter",
  weaponType: "bow",
  img: AlleyHunter,
  rarity: 4,
  passiveName: "Urban Guerrilla",
  passiveDescription: (refineIndex) => `Every 4s a character is on the field, their ATK increases by ${refinementVals[refineIndex]}% and their CRIT DMG increases by ${refinementVals[refineIndex]}%. This effect has a maximum of 5 stacks and will not be reset if the character leaves the field, but will be cleared when the character takes DMG.`,
  description: "An intricate, opulent longbow. It once belonged to a gentleman thief who was never caught.",
  baseStats: {
    main: [41, NaN, NaN, NaN, 99, 125, NaN, NaN, NaN, 184, 210, NaN, 238, 264, NaN, 293, 319, NaN, 347, 373, NaN, 401, 427, NaN, 454],
    subStatKey: "critRate_",
    sub: [8, NaN, NaN, NaN, 14.1, 14.1, NaN, NaN, NaN, 20.6, 20.6, NaN, 23.8, 23.8, NaN, 27.1, 27.1, NaN, 30, 30, NaN, 33.5, 33.5, NaN, 36.8],
  },
  conditional: {
    type: "weapon",
    sourceKey: "AlleyHunter",
    maxStack: 5,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex],
      critRate_: refinementVals[refineIndex]
    })
  }
}
export default weapon