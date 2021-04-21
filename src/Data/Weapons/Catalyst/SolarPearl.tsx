import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Solar_Pearl.png'
const conditionals: Conditionals = {
  ss: {
    name: "Hits",
    states: {
      n: {
        name: "Normal attack",
        stats: stats => ({
          skill_dmg_: refinementVals[stats.weapon.refineIndex],
          burst_dmg_: refinementVals[stats.weapon.refineIndex],
        })
      },
      s: {
        name: "Skill or Burst",
        stats: stats => ({
          normal_dmg_: refinementVals[stats.weapon.refineIndex]
        })
      },
      b: {
        name: "Both Normal & Skill/Burst",
        stats: stats => ({
          skill_dmg_: refinementVals[stats.weapon.refineIndex],
          burst_dmg_: refinementVals[stats.weapon.refineIndex],
          normal_dmg_: refinementVals[stats.weapon.refineIndex]
        })
      }
    }
  }
}
const refinementVals = [20, 25, 30, 35, 40]
const weapon: WeaponSheet = {
  name: "Solar Pearl",
  weaponType: "catalyst",
  img,
  rarity: 4,
  passiveName: "Solar Shine",
  passiveDescription: stats => `Normal Attack hits increase Elemental Skill and Elemental Burst DMG by ${refinementVals[stats.weapon.refineIndex]}% for 6s. Likewise, Elemental Skill or Elemental Burst hits increase Normal Attack DMG by ${refinementVals[stats.weapon.refineIndex]}% for 6s.`,
  description: "A dull, golden pearl made of an unknown substance that harbors the light of the sun and the moon, and pulses with a warm strength.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "critRate_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  conditionals
}
export default weapon