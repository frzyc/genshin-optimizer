import LithicBlade from './Weapon_Lithic_Blade.png'
const refinementCritVals = [2, 3, 4, 6, 6]
const refinementAtkVals = [6, 7, 8, 9, 10]
const weapon = {
  name: "Lithic Blade",
  weaponType: "claymore",
  img: LithicBlade,
  rarity: 4,
  passiveName: "Lithic Axiom - Unity",
  passiveDescription: (refineIndex) => `For every character in the party who hails from Liyue, the character who equips this weapon gains ${refinementAtkVals[refineIndex]}% ATK increase and ${refinementCritVals[refineIndex]}% CRIT Rate increase.`,
  description: "A greatsword carved and chiseled from the very bedrock of Liyue.",
  baseStats: {
    main: [41, NaN, NaN, NaN, 99, 125, NaN, NaN, NaN, 184, 210, NaN, 238, 264, NaN, 293, 319, NaN, 347, 373, NaN, 401, 427, NaN, 454],
    subStatKey: "crit_dmg",
    sub: [16, NaN, NaN, NaN, 28.3, 28.3, NaN, NaN, NaN, 41.2, 41.2, NaN, 47.7, 47.7, NaN, 54.1, 54.1, NaN, 60.6, 60.6, NaN, NaN, NaN, NaN, NaN],
  },
  conditional: {
    type: "weapon",
    sourceKey: "LithicBlade",
    maxStack: 4,
    stats: (refineIndex) => ({
      atk_: refinementAtkVals[refineIndex],
      crit_rate: refinementCritVals[refineIndex]
    })
  }
}
export default weapon