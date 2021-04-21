import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Wine_and_Song.png'

const refinementSprintVals = [14, 16, 18, 20, 22]
const refinementATKVals = [20, 25, 30, 35, 40]
const conditionals : Conditionals = {
  ws: {
    name: "After Sprint",
    maxStack: 1,
    stats: stats => ({
      atk_: refinementATKVals[stats.weapon.refineIndex],//TODO: stamine decrease for sprint
    })
  }
}
const weapon : WeaponSheet = {
  name: "Wine and Song",
  weaponType: "catalyst",
  img,
  rarity: 4,
  passiveName: "Wind in the Square",
  passiveDescription: stats => `Hitting an opponent with a Normal Attack decreases the Stamina consumption of Sprint or Alternate sprint by ${refinementSprintVals[stats.weapon.refineIndex]}% for 5s. Additionally, using a Sprint or Alternate Sprint ability increases ATK by ${refinementATKVals[stats.weapon.refineIndex]}% for 5s.`,
  description: "A songbook from the bygone aristocratic era, whose composer has become forgotten. It chronicles the tale of a certain heroic outlaw.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "enerRech_",
    sub: [6.7, 7.7, 9.1, 10.4, 11.8, 11.8, 13.1, 14.5, 15.8, 17.2, 17.2, 18.5, 19.9, 19.9, 21.2, 22.6, 22.6, 23.9, 25.2, 25.2, 26.6, 27.9, 27.9, 29.3, 30.6],
  },
  conditionals,
}
export default weapon