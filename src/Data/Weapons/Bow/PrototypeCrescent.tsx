import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Prototype_Crescent.png'

const refinementVals = [36, 45, 54, 63, 72]
const conditionals: IConditionals = {
  u: {
    name: "Against Weak Points",
    maxStack: 1,
    stats: stats => ({
      moveSPD_: 10,
      atk_: refinementVals[stats.weapon.refineIndex]
    }),
  }
}
const weapon: IWeaponSheet = {
  name: "Prototype Crescent",
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: "Unreturning",
  passiveDescription: stats => `Charged Attack hits on weak points increase Movement SPD by 10% and ATK by ${refinementVals[stats.weapon.refineIndex]}% for 10s.`,
  description: "A prototype longbow discovered in the Blackcliff Forge. The arrow fired from this bow glimmers like a ray of moonlight.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditionals,
}
export default weapon