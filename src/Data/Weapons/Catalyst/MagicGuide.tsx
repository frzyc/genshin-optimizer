import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Magic_Guide.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals : Conditionals = {
  bst: {
    name: "Against Opponents Accefted by Hydro/Electro",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Magic Guide",
  weaponType: "catalyst",
  img,
  rarity: 3,
  passiveName: "Bane of Storm and Tide",
  passiveDescription: stats => `Increases DMG against enemies affected by Hydro or Electro by ${refinementVals[stats.weapon.refineIndex]}%.`,
  description: "Version 12. A reprint featuring corrections to Version 11 and brand-new additions based on recent developments.",
  baseStats: {
    main: [38, 48, 61, 73, 86, 105, 117, 129, 140, 151, 171, 182, 193, 212, 223, 234, 253, 264, 274, 294, 304, 314, 334, 344, 354],
    subStatKey: "eleMas",
    sub: [41, 47, 56, 64, 72, 72, 80, 89, 97, 105, 105, 113, 122, 122, 130, 138, 138, 146, 154, 154, 163, 171, 171, 179, 187],
  },
  conditionals,
}
export default weapon