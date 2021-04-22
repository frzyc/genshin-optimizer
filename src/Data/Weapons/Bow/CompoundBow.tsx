import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Compound_Bow.png'

const refinementVals = [4, 5, 6, 7, 8]
const refinementSpdVals = [1.2, 1.5, 1.8, 2.1, 2.4]
const conditionals : IConditionals = {
  ia: {
    name: "Normal/Charged Attack Hits",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex],
      atkSPD_: refinementSpdVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Compound Bow",
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: "Infusion Arrow",
  passiveDescription: stats => `Normal Attack and Charged Attack hits increase ATK by ${refinementVals[stats.weapon.refineIndex]}% and Normal ATK SPD by ${refinementSpdVals[stats.weapon.refineIndex]}% for 6s. Max 4 stacks. Can only occur once every 0.3s.`,
  description: "An exotic metallic bow from a distant land. Though extremely difficult to maintain, it is easy to nock and fires with tremendous force.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    subStatKey: "physical_dmg_",
    sub: [15, 17.4, 20.5, 23.5, 26.5, 26.5, 29.6, 32.6, 35.6, 38.7, 38.7, 41.7, 44.7, 44.7, 47.8, 50.8, 50.8, 53.8, 56.8, 56.8, 59.9, 62.9, 62.9, 65.9, 69],
  },
  conditionals,
}
export default weapon