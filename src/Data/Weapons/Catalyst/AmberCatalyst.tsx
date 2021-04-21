import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Amber_Catalyst.png'

const refinementVals = [6, 7.5, 9, 10.5, 12]
const conditionals : Conditionals = {
  em: {
    name: "Normal Attack Hits",
    maxStack: 2,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Amber Catalyst",
  weaponType: "catalyst",
  img,
  rarity: 3,
  passiveName: "Elemental Mastery",
  passiveDescription: stats => `Normal Attack hits increase all Elemental DMG by ${refinementVals[stats.weapon.refineIndex]}% for 6s. Max 2 stacks.`,
  description: "A catalyst carved out of amber that gains a warm halo under the sun.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "eleMas",
    sub: [31, 36, 42, 48, 54, 54, 60, 66, 73, 79, 79, 85, 91, 91, 97, 104, 104, 110, 116, 116, 122, 128, 128, 134, 141],
  },
  conditionals,
}
export default weapon