import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Skyrider_Sword.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals : Conditionals = {
  d: {
    name: "After Elemental Burst",
    maxStack: 1,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex],
      moveSPD_: refinementVals[stats.weapon.refineIndex],
    })
  }
}
const weapon : WeaponSheet = {
  name: "Skyrider Sword",
  weaponType: "sword",
  img,
  rarity: 3,
  passiveName: "Determination",
  passiveDescription: stats => `Using an Elemental Burst grants a ${refinementVals[stats.weapon.refineIndex]}% increase in ATK and Movement SPD for 15s.`,
  description: "A reliable steel sword. The legendary Skyrider once tried to ride it as a flying sword...",
  baseStats: {
    main: [38, 48, 61, 73, 86, 105, 117, 129, 140, 151, 171, 182, 193, 212, 223, 234, 253, 264, 274, 294, 304, 314, 334, 344, 354],
    subStatKey: "enerRech_",
    sub: [11.3, 13.2, 15.4, 17.7, 20, 20, 22.3, 24.6, 26.9, 29.2, 29.2, 31.5, 33.8, 33.8, 36.1, 38.3, 38.3, 40.6, 42.9, 42.9, 45.2, 47.5, 47.5, 49.8, 52.1],
  },
  conditionals,
}
export default weapon