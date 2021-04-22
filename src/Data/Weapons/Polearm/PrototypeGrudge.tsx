import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Prototype_Grudge.png'

const refinementVals = [8, 10, 12, 14, 16]
const conditionals : IConditionals = {
  ma: {
    name: "Elemental Skills",
    maxStack: 2,
    stats: stats => ({
      normal_dmg_: refinementVals[stats.weapon.refineIndex],
      charged_dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Prototype Starglitter",
  weaponType: "polearm",
  img,
  rarity: 4,
  passiveName: "Magic Affinity",
  passiveDescription: stats => `After using an Elemental Skill, increases Normal and Charged Attack DMG by ${refinementVals[stats.weapon.refineIndex]}% for 12s. Max 2 stacks.`,
  description: "A grudge discovered in the Blackcliff Forge. The glimmers along the sharp edge are like stars in the night.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "enerRech_",
    sub: [10, 11.6, 13.6, 15.7, 17.7, 17.7, 19.7, 21.7, 23.7, 25.8, 25.8, 27.8, 29.8, 29.8, 31.8, 33.8, 33.8, 35.9, 37.9, 37.9, 39.9, 41.9, 41.9, 43.9, 45.9],
  },
  conditionals,
}
export default weapon