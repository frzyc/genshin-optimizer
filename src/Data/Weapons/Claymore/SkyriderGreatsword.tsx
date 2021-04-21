import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Skyrider_Greatsword.png'

const refinementVals = [6, 7, 8, 9, 10]
const conditionals : Conditionals = {
  c: {
    name: "Normal/Charged Attack Hits",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Skyrider Greatsword",
  weaponType: "claymore",
  img,
  rarity: 3,
  passiveName: "Courage",
  passiveDescription: stats => `On hit, Normal or Charged Attacks increase ATK by ${refinementVals[stats.weapon.refineIndex]}% for 6s. Max 4 stacks. Can occur once every 0.5s.`,
  description: "A reliable steel sword. The legendary Skyrider once tried to ride it as a flying sword... for the second time.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "physical_dmg_",
    sub: [9.6, 11.1, 13, 15, 16.9, 16.9, 18.8, 20.8, 22.7, 24.6, 24.6, 26.5, 28.5, 28.5, 30.4, 32.3, 32.3, 34.3, 36.2, 36.2, 38.1, 40.1, 40.1, 42, 43.9],
  },
  conditionals,
}
export default weapon