import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Twin_Nephrite.png'

const refinementVals = [12, 14, 16, 18, 20]
const conditionals : IConditionals = {
  gt: {
    name: "Opponents Defeated",
    maxStack: 1,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex],
      moveSPD_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Twin Nephrite",
  weaponType: "catalyst",
  img,
  rarity: 3,
  passiveName: "Guerilla Tactic",
  passiveDescription: stats => `Defeating an enemy increases Movement SPD and ATK by ${refinementVals[stats.weapon.refineIndex]}% for 15s.`,
  description: "A jade pendant formed by piecing together two jade stones.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    subStatKey: "critRate_",
    sub: [3.4, 4, 4.6, 5.3, 6, 6, 6.7, 7.4, 8.1, 8.8, 8.8, 9.4, 10.1, 10.1, 10.8, 11.5, 11.5, 12.2, 12.9, 12.9, 13.6, 14.2, 14.2, 14.9, 15.6],
  },
  conditionals,
}
export default weapon