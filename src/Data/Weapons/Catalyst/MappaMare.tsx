import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Mappa_Mare.png'

const refinementVals = [8, 10, 12, 14, 16]
const conditionals : IConditionals = {
  is: {
    name: "Elemental Reactions",
    maxStack: 2,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Mappa Mare",
  weaponType: "catalyst",
  img,
  rarity: 4,
  passiveName: "Infusion Scroll",
  passiveDescription: stats => `Triggering an Elemental reaction grants a ${refinementVals[stats.weapon.refineIndex]}% Elemental DMG Bonus for 10s. Max 2 stacks.`,
  description: "A nautical chart featuring nearby currents and climates that somehow found its way into Liyue via foreign traders.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "eleMas",
    sub: [24, 28, 33, 38, 42, 42, 47, 52, 57, 62, 62, 67, 71, 71, 76, 81, 81, 86, 91, 91, 96, 101, 101, 105, 110],
  },
  conditionals,
}
export default weapon