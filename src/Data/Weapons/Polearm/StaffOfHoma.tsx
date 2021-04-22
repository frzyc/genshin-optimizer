import DisplayPercent from '../../../Components/DisplayPercent'
import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Staff_of_Homa.png'

const refinementVals_hp = [20, 25, 30, 35, 40]
const refinementVals_hp_atk = [0.8, 1, 1.2, 1.4, 1.6]
const refinementVals_hp_atk_add = [1, 1.2, 1.4, 1.6, 1.8]
const conditionals: IConditionals = {
  esj: {
    name: "Low HP",
    maxStack: 1,
    stats: stats => ({
      modifiers: { finalATK: { finalHP: refinementVals_hp_atk_add[stats.weapon.refineIndex] / 100 } }
    })
  }
}
const weapon: WeaponSheet = {
  name: "Staff of Homa",
  weaponType: "polearm",
  img,
  rarity: 5,
  passiveName: "Eagle Spear of Justice",
  passiveDescription: stats => <span>HP increased by {refinementVals_hp[stats.weapon.refineIndex]}%. Additionally, provides an ATK Bonus based on {refinementVals_hp_atk[stats.weapon.refineIndex]}% of the wielder's Max HP{DisplayPercent(refinementVals_hp_atk[stats.weapon.refineIndex], stats, "finalHP")}. When the wielder's HP is less than 50%, this ATK bonus is increased by an additional {refinementVals_hp_atk_add[stats.weapon.refineIndex]}% of Max HP{DisplayPercent(refinementVals_hp_atk_add[stats.weapon.refineIndex], stats, "finalHP")}.</span>
  ,
  description: "A \"firewood staff\" that was once used in ancient and long-lost rituals.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    subStatKey: "critDMG_",
    sub: [14.4, 16.7, 19.6, 22.5, 25.4, 25.4, 28.4, 31.3, 34.2, 37.1, 37.1, 40, 42.9, 42.9, 45.8, 48.7, 48.7, 51.6, 54.5, 54.5, 57.4, 60.3, 60.3, 63.2, 66.2],
  },
  stats: stats => ({
    hp_: refinementVals_hp[stats.weapon.refineIndex],
    modifiers: { finalATK: { finalHP: refinementVals_hp_atk[stats.weapon.refineIndex] / 100 } }
  }),
  conditionals,
}
export default weapon