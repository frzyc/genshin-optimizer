import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Lithic_Blade.png'

const refinementCritVals = [3, 4, 5, 6, 7]
const refinementAtkVals = [7, 8, 9, 10, 11]
const conditionals: IConditionals = {
  lau: {
    name: "Liyue Members",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementAtkVals[stats.weapon.refineIndex],
      critRate_: refinementCritVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Lithic Blade",
  weaponType: "claymore",
  img,
  rarity: 4,
  passiveName: "Lithic Axiom - Unity",
  passiveDescription: stats => `For every character in the party who hails from Liyue, the character who equips this weapon gains ${refinementAtkVals[stats.weapon.refineIndex]}% ATK increase and ${refinementCritVals[stats.weapon.refineIndex]}% CRIT Rate increase. This effect stacks up to 4 times.`,
  description: "A greatsword carved and chiseled from the very bedrock of Liyue.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditionals
}
export default weapon