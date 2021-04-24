import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Blackcliff_Warbow.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals : IConditionals = {
  pa: {
    name: "Opponents Defeated",
    maxStack: 3,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Blackcliff Warbow",
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: "Press the Advantage",
  passiveDescription: stats => `After defeating an opponent, ATK is increased by ${refinementVals[stats.weapon.refineIndex]}% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others.`,
  description: "A bow made of blackcliff that features extremely sturdy bow limbs. It requires an archer with a strong bow arm to use.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "critDMG_",
    sub: [8, 9.3, 10.9, 12.5, 14.1, 14.1, 15.8, 17.4, 19, 20.6, 20.6, 22.2, 23.8, 23.8, 25.4, 27.1, 27.1, 28.7, 30.3, 30.3, 31.9, 33.5, 33.5, 35.1, 36.8],
  },
  conditionals,
}
export default weapon