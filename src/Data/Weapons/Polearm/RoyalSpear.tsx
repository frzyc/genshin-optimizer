import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Royal_Spear.png'

const refinementVals = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  f: {
    name: "Opponents Damaged",
    maxStack: 5,
    stats: stats => ({
      critRate_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Royal Spear",
  weaponType: "polearm",
  img,
  rarity: 4,
  passiveName: "Focus",
  passiveDescription: stats => `Upon damaging an opponent, increases CRIT Rate by ${refinementVals[stats.weapon.refineIndex]}%. Max 5 stacks. A CRIT Hit removes all stacks.`,
  description: "This polearm was once cherished by a member of the old nobility that governed Mondstadt long ago. Although it has never seen the light of day, it is still incomparably sharp.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    substatKey: "atk_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  conditionals,
}
export default weapon