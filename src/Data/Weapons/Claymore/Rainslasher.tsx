import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Rainslasher.png'

const refinementVals = [20, 24, 28, 32, 36]
const conditionals : Conditionals = {
  bst: {
    name: "Against Opponents Affected by Hydro/Electro",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Rainslasher",
  weaponType: "claymore",
  img,
  rarity: 4,
  passiveName: "Bane of Storm and Tide",
  passiveDescription: stats => `Increases DMG against opponents affected by Hydro or Electro by ${refinementVals[stats.weapon.refineIndex]}%.`,
  description: "A fluorescent greatsword with no sharp edge that crushes enemies with brute force and raw power.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "eleMas",
    sub: [36, 42, 49, 56, 64, 64, 71, 78, 85, 93, 93, 100, 107, 107, 115, 122, 122, 129, 136, 136, 144, 151, 151, 158, 165],
  },
  conditionals,
}
export default weapon