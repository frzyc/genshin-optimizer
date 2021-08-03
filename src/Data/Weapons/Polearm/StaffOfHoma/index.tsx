import { WeaponData } from 'pipeline'
import Stat from '../../../../Stat'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import { KeyPath } from '../../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../../formula'
import data_gen from './data_gen.json'
import img from './Weapon_Staff_of_Homa.png'
import formula, { data } from './data'

const path = KeyPath<FormulaPathBase>().weapon.StaffOfHoma
const refinementVals_hp = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  hp: {
    name: "HP < 50%",
    maxStack: 1,
    stats: {
      modifiers: { finalATK: [path.esjadd()] }
    },
    fields: [{
      text: "ATK Increase",
      formulaText: stats => <span>{data.hp_atk_add[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats, true)}</span>,
      formula: formula.esjadd,
    }],
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    hp_: refinementVals_hp[stats.weapon.refineIndex],
    modifiers: { finalATK: [path.esj()] }
  }),
  conditionals,
  document: [{
    fields: [{
      text: "ATK Increase",
      formulaText: stats => <span>{data.hp_atk[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats, true)}</span>,
      formula: formula.esj,
    }],
    conditional: conditionals.hp
  }],
}
export default weapon