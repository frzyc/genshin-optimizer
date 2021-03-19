import TheAlleyFlash from './Weapon_The_Alley_Flash.png'
const refinementVals = [12, 15, 18, 21, 24]
const weapon = {
  name: "The Alley Flash",
  weaponType: "sword",
  img: TheAlleyFlash,
  rarity: 4,
  passiveName: "Itinerant Hero",
  passiveDescription: (refineIndex) => `Increases DMG dealt by the character equipping this weapon by ${refinementVals[refineIndex]}%. Taking DMG disables this effect for 5s.`,
  description: "A straight sword as black as the night. It once belonged to a thief who roamed the benighted streets.",
  baseStats: {
    main: [45, 63, 86, 110, 134, 160, 185, 210, 235, 261, 287, 313, 340, 366, 392, 419, 445, 472, 499, 525, 552, 579, 605, 633, 660],
    subStatKey: "eleMas",
    sub: [12, 14, 16, 19, 21, 21, 24, 26, 28, 31, 31, 33, 36, 36, 38, 41, 41, 43, 45, 45, 48, 50, 50, 53, 55],
  },
  conditional: {
    type: "weapon",
    sourceKey: "TheAlleyFlash",
    maxStack: 1,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon