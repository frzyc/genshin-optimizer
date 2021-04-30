import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Harbinger_of_Dawn.png'

const refinementVals = [14, 17.5, 21, 24.5, 28]
const conditionals: IConditionals = {
  v: {
    name: "High HP",
    maxStack: 1,
    stats: stats => ({
      critRate_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Harbinger of Dawn",
  weaponType: "sword",
  img,
  rarity: 3,
  passiveName: "Vigorous",
  passiveDescription: stats => `When HP is above 90%, increases CRIT Rate by ${refinementVals[stats.weapon.refineIndex]}%.`,
  description: "A sword that once shone like the sun. The wielder of this sword will be blessed with a \"feel-good\" buff. The reflective material on the blade has long worn off.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    substatKey: "critDMG_",
    sub: [10.2, 11.9, 13.9, 16, 18, 18, 20.1, 22.1, 24.2, 26.3, 26.3, 28.3, 30.4, 30.4, 32.4, 34.5, 34.5, 36.6, 38.6, 38.6, 40.7, 42.7, 42.7, 44.8, 46.9],
  },
  conditionals,
}
export default weapon