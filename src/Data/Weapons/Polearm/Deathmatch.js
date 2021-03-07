import Deathmatch from './Weapon_Deathmatch.png'
const refinementVals = [16, 20, 24, 28, 32]
const refinementSoloVals = [24, 30, 36, 42, 48]
const weapon = {
  name: "Deathmatch",
  weaponType: "polearm",
  img: Deathmatch,
  rarity: 4,
  passiveName: "Gladiator",
  passiveDescription: (refineIndex) => `If there are at least 2 opponents nearby, ATK is increased by ${refinementVals[refineIndex]}% and DEF is increased by ${refinementVals[refineIndex]}%. If there are less than 2 opponents nearby, ATK is increased by ${refinementSoloVals[refineIndex]}%.`,
  description: "A sharp crimson polearm that was once a gladiator's priceless treasure. Its awl has been stained by the blood of countless beasts and men.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    subStatKey: "critRate_",
    sub: [8, 9.3, 10.9, 12.5, 14.1, 14.1, 15.8, 17.4, 19, 20.6, 20.6, 22.2, 23.8, 23.8, 25.4, 27.1, 27.1, 28.7, 30.3, 30.3, 31.9, 33.5, 33.5, 35.1, 36.8],
  },
  conditional: [{
    type: "weapon",
    condition: "At least 2 opponents",
    sourceKey: "Deathmatch",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementVals[refineIndex],
      def_: refinementVals[refineIndex]
    })
  }, {
    type: "weapon",
    condition: "Less than 2 opponents",
    sourceKey: "Deathmatch",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementSoloVals[refineIndex]
    })
  }]
}
export default weapon