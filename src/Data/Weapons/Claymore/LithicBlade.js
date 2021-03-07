import LithicBlade from './Weapon_Lithic_Blade.png'
const refinementCritVals = [3, 4, 5, 6, 7]
const refinementAtkVals = [7, 8, 9, 10, 11]
const weapon = {
  name: "Lithic Blade",
  weaponType: "claymore",
  img: LithicBlade,
  rarity: 4,
  passiveName: "Lithic Axiom - Unity",
  passiveDescription: (refineIndex) => `For every character in the party who hails from Liyue, the character who equips this weapon gains ${refinementAtkVals[refineIndex]}% ATK increase and ${refinementCritVals[refineIndex]}% CRIT Rate increase. This effect stacks up to 4 times.`,
  description: "A greatsword carved and chiseled from the very bedrock of Liyue.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditional: {
    type: "weapon",
    sourceKey: "LithicBlade",
    maxStack: 4,
    stats: (refineIndex) => ({
      atk_: refinementAtkVals[refineIndex],
      critRate_: refinementCritVals[refineIndex]
    })
  }
}
export default weapon